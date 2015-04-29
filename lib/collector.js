var _ = require('lodash');
var istanbul = require('istanbul');

var collector = module.exports = {
    getMissedLines: function(coverage) {
        var report = {};
        // Collect function coverage
        _.each(coverage.f, function(count, line) {
            if (count > 0) return;
            var start = coverage.fnMap[line].loc.start;
            report[start.line] = 'f';
        });
        // Collect branch coverage
        _.each(coverage.b, function(counts, line) {
            counts.map(function(count, i) {
                if (count > 0) return;
                var location = coverage.branchMap[line].locations[i];
                report[location.start.line] = { start: location.start.column, end: location.end.column };
            });
        });
        // Collect statement coverage
        _.each(coverage.s, function(count, line) {
            if (count > 0) return;
            var start = coverage.statementMap[line].start;
            var end = coverage.statementMap[line].end;
            _.range(start.line, end.line + 1).map(function(i) {
                report[i] = 's';
            });
        });

        return report;
    }
};

