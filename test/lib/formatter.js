var _ = require('lodash');
var assert = require('assert');
var formatter = require('../../lib/formatter');

assert.contains = function(actual, expected) {
    assert(actual.indexOf(expected) !== -1, JSON.stringify(actual) + ' does not contain ' + JSON.stringify(expected));
};

var stripFormatting = function(string) {
    return string.replace(/\033\[\d+m/g, '');
};

var formatText = function(code, string) {
    return '\033[' + code + 'm' + string + '\033[0m';
};

var format = {
    red: _.partial(formatText, 31),
    green: _.partial(formatText, 32),
    grey: _.partial(formatText, 90),
    bold: _.partial(formatText, 1)
};

describe('outputSummary', function() {
    it('should render a summary table of results', function() {
        var thresholds = {
            global: { lines: -20, statements: 90, functions: 80, branches: 70 },
            each: { lines: 100, statements: 100, functions: -30, branches: 100 }
        };

        var summary = [
            { type: 'lines', failed: true, value: -15, filesFailed: ['/path/test.js', '/path/test2.js'] },
            { type: 'statements', failed: true, value: 40, filesFailed: ['/path/test.js', '/path/test2.js'] },
            { type: 'functions', failed: true, value: 65, filesFailed: ['/path/test2.js'] },
            { type: 'branches', failed: false, value: 80, filesFailed: [] }
        ];

        var expected = [
            'Coverage report',
            '--------------------------------------------------------------------------------',
            ' Lines      | 15 gaps (threshold 20 gaps)  | 2 files failed (threshold 100%)    ',
            ' Statements | 40% coverage (threshold 90%) | 2 files failed (threshold 100%)    ',
            ' Functions  | 65% coverage (threshold 80%) | 1 files failed (threshold 30 gaps) ',
            ' Branches   | 80% coverage (threshold 70%) | All files passed (threshold 100%)  ',
            '--------------------------------------------------------------------------------'
        ].join('\n');

        assert.equal(stripFormatting(formatter.outputSummary(thresholds, summary)), expected);
    });

    it('should colour results correctly', function() {
        var thresholds = {
            global: { lines: -20, statements: 90, functions: 80, branches: 70 },
            each: { lines: 100, statements: 100, functions: -30, branches: 100 }
        };

        var summary = [
            { type: 'lines', failed: true, value: -15, filesFailed: ['/path/test.js', '/path/test2.js'] },
            { type: 'statements', failed: true, value: 40, filesFailed: ['/path/test.js', '/path/test2.js'] },
            { type: 'functions', failed: true, value: 65, filesFailed: ['/path/test2.js'] },
            { type: 'branches', failed: false, value: 80, filesFailed: [] }
        ];

        var expected = [
            'Coverage report',
            '--------------------------------------------------------------------------------',
            ' Lines      | 15 gaps (threshold 20 gaps)  | 2 files failed (threshold 100%)    ',
            ' Statements | 40% coverage (threshold 90%) | 2 files failed (threshold 100%)    ',
            ' Functions  | 65% coverage (threshold 80%) | 1 files failed (threshold 30 gaps) ',
            ' Branches   | 80% coverage (threshold 70%) | All files passed (threshold 100%)  ',
            '--------------------------------------------------------------------------------'
        ].join('\n');


        var table = formatter.outputSummary(thresholds, summary);
        assert.contains(table, format.red('15 gaps (threshold 20 gaps)'));
        assert.contains(table, format.red('2 files failed (threshold 100%)'));
        assert.contains(table, format.green('80% coverage (threshold 70%)'));
        assert.contains(table, format.green('All files passed (threshold 100%)'));
    });
});

describe('outputFile', function() {
    it('should render a summary of missing coverage in a file', function() {
        var file = [
            'var test = function(value) {',
            '    if (!value) return false;',
            '    return true;',
            '};'
        ].join('\n');

        var missing = {
            '1': 'f',
            '2': 's',
            '4': 's'
        };

        var expected = [
            '',
            'Missing coverage in /path/file.js',
            ' 1 | var test = function(value) {',
            ' 2 |     if (!value) return false;',
            ' ~ | ',
            ' 4 | };'
        ].join('\n');

        assert.equal(stripFormatting(formatter.outputFile('/path/file.js', file, missing)), expected);
    });

    it('should not render a summary if the file has no missing coverage', function() {
        var file = [
            'var test = function(value) {',
            '    if (!value) return false;',
            '    return true;',
            '};'
        ].join('\n');

        assert.equal(formatter.outputFile('/path/file.js', file, {}), undefined);
    });
});
