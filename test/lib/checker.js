var _ = require('lodash');
var assert = require('assert');
var checker = require('../../lib/checker');
var istanbul = require('istanbul');
var sinon = require('sinon');

describe('checkThreshold', function() {
    it('checks percentage threshold passes', function() {
        var coverage = { total: 125, covered: 75, skipped: 0, pct: 60, type: 'lines' };
        assert.deepEqual(checker.checkThreshold(60, coverage), { failed: false, value: 60, type: 'lines' });
    });

    it('checks percentage threshold fails', function() {
        var coverage = { total: 125, covered: 75, skipped: 0, pct: 60, type: 'lines' };
        assert.deepEqual(checker.checkThreshold(80, coverage), { failed: true, value: 60, type: 'lines' });
    });

    it('checks gap threshold passes', function() {
        var coverage = { total: 50, covered: 40, skipped: 0, pct: 80, type: 'lines' };
        assert.deepEqual(checker.checkThreshold(-10, coverage), { failed: false, value: -10, type: 'lines' });
    });

    it('checks gap threshold fails', function() {
        var coverage = { total: 50, covered: 40, skipped: 0, pct: 80, type: 'lines' };
        assert.deepEqual(checker.checkThreshold(-5, coverage), { failed: true, value: -10, type: 'lines' });
    });
});

describe('checkThresholds', function() {
    it('checks all thresholds', function() {
        var thresholds = { lines: -20, statements: 60, functions: -50, branches: 66 };
        var coverage = {
            lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
            statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
            functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
            branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
        };

        assert.deepEqual(checker.checkThresholds(thresholds, coverage), [
            { type: 'lines', value: -10, failed: false },
            { type: 'statements', value: 50, failed: true },
            { type: 'functions', value: -60, failed: true },
            { type: 'branches', value: 66.67, failed: false }
        ]);
    });
});

describe('checkFailures', sinon.test(function() {
    this.stub(istanbul.utils, 'summarizeCoverage').returns({
        lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
        statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
        functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
        branches: { total: 90, covered: 60, skipped: 0, pct: 66.67 }
    });

    this.stub(istanbul.utils, 'summarizeFileCoverage')
        .onCall(0).returns({
            lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
            statements: { total: 120, covered: 120, skipped: 0, pct: 100 },
            functions: { total: 80, covered: 80, skipped: 0, pct: 100 },
            branches: { total: 90, covered: 90, skipped: 0, pct: 100 }
        })
        .onCall(1).returns({
            lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
            statements: { total: 120, covered: 60, skipped: 0, pct: 50 },
            functions: { total: 80, covered: 20, skipped: 0, pct: 25 },
            branches: { total: 90, covered: 90, skipped: 0, pct: 100 }
        });

    var coverage = {
        '/file/test.js': {},
        '/file/test2.js': {}
    };

    var thresholds = {
        global: { lines: 90, statements: 100, functions: 100, branches: 100 },
        each: { lines: 100, statements: 100, functions: 100, branches: 100 }
    };

    assert.deepEqual(checker.checkFailures(thresholds, coverage), [
        { failed: false, type: 'lines', value: 90, filesFailed: ['/file/test.js', '/file/test2.js'] },
        { failed: true, type: 'statements', value: 50, filesFailed: ['/file/test2.js'] },
        { failed: true, type: 'functions', value: 25, filesFailed: ['/file/test2.js'] },
        { failed: true, type: 'branches', value: 66.67, filesFailed: [] }
    ]);
}));

describe('getMissedLines', function() {
    var coverage = require('../fixtures/coverage');
    assert.deepEqual(checker.getMissedLines(coverage), { '1': 's', '2': 's', '3': 's', '4': 's' });
});

