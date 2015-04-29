var _ = require('lodash');
var assert = require('assert');
var formatter = require('../../lib/formatter');
var format = require('../../lib/bash-format');

assert.contains = function(actual, expected) {
    assert(actual.indexOf(expected) !== -1, JSON.stringify(actual) + ' does not contain ' + JSON.stringify(expected));
};

describe('outputSummary', function() {
    var thresholds = {
        global: { lines: -12, statements: -20, functions: 80, branches: 70 },
        each: { lines: 90, statements: 100, functions: -30, branches: 100 }
    };

    var summary = [
        {
            type: 'lines',
            global: { failed: true, value: -15 },
            each: { failed: true, failures: ['/path/test.js', '/path/test2.js'] }
        }, {
            type: 'statements',
            global: { failed: false, value: -16 },
            each: { failed: true, failures: ['/path/test.js', '/path/test2.js'] }
        }, {
            type: 'functions',
            global: { failed: true, value: 65 },
            each: { failed: true, failures: ['/path/test2.js'] }
        }, {
            type: 'branches',
            global: { failed: false, value: 80 },
            each: { failed: false, failures: [] }
        }
    ];

    var expected = [
        'Coverage report',
        '--------------------------------------------------------------------------------',
        ' Lines      | 15 gaps (threshold 12 gaps)  | 2 files failed (threshold 90%)     ',
        ' Statements | 16 gaps (threshold 20 gaps)  | 2 files failed (threshold 100%)    ',
        ' Functions  | 65% coverage (threshold 80%) | 1 files failed (threshold 30 gaps) ',
        ' Branches   | 80% coverage (threshold 70%) | All files passed (threshold 100%)  ',
        '--------------------------------------------------------------------------------',
        ''
    ].join('\n');

    it('should render a summary table of results', function() {
        assert.equal(format.strip(formatter.outputSummary(thresholds, summary)), expected);
    });

    it('should colour results correctly', function() {
        var table = formatter.outputSummary(thresholds, summary);

        assert.contains(table, format.red('15 gaps (threshold 12 gaps)'));
        assert.contains(table, format.green('16 gaps (threshold 20 gaps)'));
        assert.contains(table, format.red('65% coverage (threshold 80%)'));
        assert.contains(table, format.green('80% coverage (threshold 70%)'));

        assert.contains(table, format.red('2 files failed (threshold 90%)'));
        assert.contains(table, format.red('2 files failed (threshold 100%)'));
        assert.contains(table, format.red('1 files failed (threshold 30 gaps)'));
        assert.contains(table, format.green('All files passed (threshold 100%)'));
    });

    it('should render a summary table of results for only global thresholds', function() {
        var thresholds = {
            global: { lines: -12, statements: -20, functions: 80, branches: 70 }
        };

        var expected = [
            'Coverage report',
            '-------------------------------------------',
            ' Lines      | 15 gaps (threshold 12 gaps)  ',
            ' Statements | 16 gaps (threshold 20 gaps)  ',
            ' Functions  | 65% coverage (threshold 80%) ',
            ' Branches   | 80% coverage (threshold 70%) ',
            '-------------------------------------------',
            ''
        ].join('\n');

        assert.equal(format.strip(formatter.outputSummary(thresholds, summary)), expected);
    });


    it('should render a summary table of results for only per file thresholds', function() {
        var thresholds = {
            each: { lines: 90, statements: 100, functions: -30, branches: 100 }
        };

        var expected = [
            'Coverage report',
            '-------------------------------------------------',
            ' Lines      | 2 files failed (threshold 90%)     ',
            ' Statements | 2 files failed (threshold 100%)    ',
            ' Functions  | 1 files failed (threshold 30 gaps) ',
            ' Branches   | All files passed (threshold 100%)  ',
            '-------------------------------------------------',
            ''
        ].join('\n');

        assert.equal(format.strip(formatter.outputSummary(thresholds, summary)), expected);
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
            'Missing coverage in /path/file.js',
            ' 1 | var test = function(value) {',
            ' 2 |     if (!value) return false;',
            ' ~ | ',
            ' 4 | };',
            ''
        ].join('\n');

        assert.equal(format.strip(formatter.outputFile('/path/file.js', file, missing)), expected);
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
