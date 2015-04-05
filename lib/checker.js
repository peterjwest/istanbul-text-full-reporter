var _ = require('lodash');
var istanbul = require('istanbul');

var checker = module.exports = {
    checkThreshold: function(threshold, summary) {
        var result = { failed: false, type: summary.type };
        // Check percentage thresholds
        if (threshold >= 0) {
            result.value = summary.pct;
            if (result.value < threshold) {
                result.failed = true;
            }
        }
        // Check gap thresholds
        else {
            result.value = summary.covered - summary.total;
            if (result.value < threshold) {
                result.failed = true;
            }
        }

        return result;
    },

    checkThresholds: function(thresholds, summary) {
        return _.map(summary, function(item, type) {
            item.type = type;
            return checker.checkThreshold(thresholds[type], item);
        });
    },

    checkFailures: function(thresholds, coverage) {
        // Check global failures
        var summary = checker.checkThresholds(thresholds.global, istanbul.utils.summarizeCoverage(coverage));

        // Check failures per file
        var failures = { statements: [], branches: [], lines: [], functions: [] };
        _.each(coverage, function(fileCoverage, filename) {
            var summary = checker.checkThresholds(thresholds.each, istanbul.utils.summarizeFileCoverage(fileCoverage));
            _.map(summary, function(item) {
                if (item.failed) failures[item.type].push(filename);
            });
        });

        summary.map(function(item) {
            item.filesFailed = failures[item.type];
        });

        return summary;
    },

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

