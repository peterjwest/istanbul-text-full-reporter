var _ = require('lodash');
var checker = require('istanbul-threshold-checker');
var fs = require('fs');
var istanbul = require('istanbul');
var path = require('path');

var formatter = require('./lib/formatter');
var collector = require('./lib/collector');

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

    writeReport: function(coverageCollector) {
        var self = this;
        var coverage = coverageCollector.getFinalCoverage();
        var failures = checker.checkFailures(this.thresholds, coverage);

        console.log(formatter.outputSummary(this.thresholds, failures));

        var globalFailure = _.any(failures, function(item) {
            return item.global && item.global.failed;
        });
        var filesFailed = _.unique(_.flatten(_.map(failures, function(item) {
            return item.each ? item.each.failures : [];
        })));

        if (globalFailure || filesFailed.length) {
            var filesFailedMap = _.indexBy(filesFailed);

            _.each(coverage, function(fileCoverage, filePath) {
                if (!globalFailure && !filesFailedMap[filePath]) return;

                var data = fs.readFileSync(filePath);
                var filename = path.relative(self.root, filePath);
                var missing = collector.getMissedLines(fileCoverage);

                var output = formatter.outputFile(filename, data.toString(), missing);
                if (output) console.log(output);
            });
        }

        this.emit('done');
    }
});

module.exports = TextFullReport;
