var _ = require('lodash');
var fs = require('fs');
var istanbul = require('istanbul');
var path = require('path');
var formatter = require('./lib/formatter');
var checker = require('./lib/checker');

var defaultThresholds = {
    global: {
        statements: 100,
        branches: 100,
        lines: 100,
        functions: 100
    },
    each: {
        statements: 100,
        branches: 100,
        lines: 100,
        functions: 100
    }
};

var TextFullReport = function(opts) {
    istanbul.Report.call(this);
    opts = opts || {};
    this.root = opts.root || process.cwd();
    this.thresholds = opts.thresholds || defaultThresholds;
};

TextFullReport.prototype = Object.create(istanbul.Report.prototype);
TextFullReport.TYPE = 'text-full';

istanbul.Report.mix(TextFullReport, {
    synopsis: function() {
        return 'text report that prints coverage gaps when coverage thresholds are not met';
    },

    getDefaultConfig: function() {
        return {};
    },

    writeReport: function(collector) {
        var self = this;
        var coverage = collector.getFinalCoverage();
        var summary = checker.checkFailures(this.thresholds, coverage);

        console.log(formatter.outputSummary(this.thresholds, summary));

        var globalFailure = _.any(summary, 'failed');
        var filesFailed = _.unique(_.flatten(_.map(summary, 'filesFailed')));

        if (globalFailure || filesFailed.length) {
            var filesFailedMap = _.indexBy(filesFailed);

            _.each(coverage, function(fileCoverage, file) {
                if (!globalFailure && !filesFailedMap[file]) return;

                fs.readFile(file, function(err, data) {
                    if (err) return self.emit('error', err);
                    var filename = path.relative(self.root, file);
                    var missing = checker.getMissedLines(fileCoverage);

                    var output = formatter.outputFile(filename, data.toString(), missing);
                    if (output) console.log(output);
                });
            });
        }

        this.emit('done');
    }
});

module.exports = TextFullReport;
