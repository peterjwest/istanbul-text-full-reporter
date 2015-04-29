var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var format = require('../lib/bash-format');
var TextFullReport = require('../index');
var coverage1 = require('./fixtures/coverage');
var coverage2 = require('./fixtures/coverage2');

describe('TextFullReport', function() {
    var reporter;

    beforeEach(function() {
        reporter = new TextFullReport();
    });

    it('should have a report synopsis', function() {
        var synopsis = 'text report that prints coverage gaps when coverage thresholds are not met';
        assert.equal(reporter.synopsis(), synopsis);
    });

    it('should have default config', function() {
        assert.deepEqual(reporter.getDefaultConfig(), {});
    });

    describe('write a report', function() {
        it('with files not covered when global thresholds are not met', sinon.test(function() {
            this.stub(console, 'log');
            this.stub(path, 'relative').returns('test.js');
            this.stub(fs, 'readFileSync').returns([
                'var test = function(value) {',
                '    if (!value) return false;',
                '    return true;',
                '};'
            ].join('\n'));

            reporter.writeReport({
                getFinalCoverage: function() { return {
                    '/path/test.js': coverage1,
                    '/path/test2.js': coverage2
                }; }
            });

            var expectedSummary = [
                'Coverage report',
                '--------------------------------------------------------------------------------',
                ' Lines      | 62.5% coverage (threshold 100%) | 1 files failed (threshold 100%) ',
                ' Statements | 62.5% coverage (threshold 100%) | 1 files failed (threshold 100%) ',
                ' Functions  | 75% coverage (threshold 100%)   | 1 files failed (threshold 100%) ',
                ' Branches   | 75% coverage (threshold 100%)   | 1 files failed (threshold 100%) ',
                '--------------------------------------------------------------------------------',
                ''
            ].join('\n');

            var expectedFile = [
                'Missing coverage in test.js',
                ' 1 | var test = function(value) {',
                ' 2 |     if (!value) return false;',
                ' 3 |     return true;',
                ' 4 | };',
                ''
            ].join('\n');

            assert.equal(console.log.callCount, 2);
            assert.equal(format.strip(console.log.getCall(0).args[0]), expectedSummary);
            assert.equal(format.strip(console.log.getCall(1).args[0]), expectedFile);
        }));

        it('with files not covered when individual thresholds are not met', sinon.test(function() {
            this.stub(console, 'log');
            this.stub(path, 'relative').returns('test.js');
            this.stub(fs, 'readFileSync').returns([
                'var test = function(value) {',
                '    if (!value) return false;',
                '    return true;',
                '};'
            ].join('\n'));

            reporter = new TextFullReport({
                thresholds: {
                    global: { lines: 60, statements: 60, functions: 75, branches: 75 },
                    each: { lines: 100, statements: 100, functions: 100, branches: 100 }
                }
            });

            reporter.writeReport({
                getFinalCoverage: function() { return {
                    '/path/test.js': coverage1,
                    '/path/test2.js': coverage2
                }; }
            });

            var expectedSummary = [
                'Coverage report',
                '-------------------------------------------------------------------------------',
                ' Lines      | 62.5% coverage (threshold 60%) | 1 files failed (threshold 100%) ',
                ' Statements | 62.5% coverage (threshold 60%) | 1 files failed (threshold 100%) ',
                ' Functions  | 75% coverage (threshold 75%)   | 1 files failed (threshold 100%) ',
                ' Branches   | 75% coverage (threshold 75%)   | 1 files failed (threshold 100%) ',
                '-------------------------------------------------------------------------------',
                ''
            ].join('\n');

            var expectedFile = [
                'Missing coverage in test.js',
                ' 1 | var test = function(value) {',
                ' 2 |     if (!value) return false;',
                ' 3 |     return true;',
                ' 4 | };',
                ''
            ].join('\n');

            assert.equal(console.log.callCount, 2);
            assert.equal(format.strip(console.log.getCall(0).args[0]), expectedSummary);
            assert.equal(format.strip(console.log.getCall(1).args[0]), expectedFile);
        }));

        it('with files not covered when individual thresholds are not specified', sinon.test(function() {
            this.stub(console, 'log');
            this.stub(path, 'relative').returns('test.js');
            this.stub(fs, 'readFileSync').returns([
                'var test = function(value) {',
                '    if (!value) return false;',
                '    return true;',
                '};'
            ].join('\n'));

            reporter = new TextFullReport({
                thresholds: {
                    global: { lines: 60, statements: 60, functions: 75, branches: 75 }
                }
            });

            reporter.writeReport({
                getFinalCoverage: function() { return {
                    '/path/test.js': coverage1,
                    '/path/test2.js': coverage2
                }; }
            });

            var expectedSummary = [
                'Coverage report',
                '---------------------------------------------',
                ' Lines      | 62.5% coverage (threshold 60%) ',
                ' Statements | 62.5% coverage (threshold 60%) ',
                ' Functions  | 75% coverage (threshold 75%)   ',
                ' Branches   | 75% coverage (threshold 75%)   ',
                '---------------------------------------------',
                ''
            ].join('\n');

            var expectedFile = [
                'Missing coverage in test.js',
                ' 1 | var test = function(value) {',
                ' 2 |     if (!value) return false;',
                ' 3 |     return true;',
                ' 4 | };',
                ''
            ].join('\n');

            assert.equal(console.log.callCount, 1);
            assert.equal(format.strip(console.log.getCall(0).args[0]), expectedSummary);
        }));

        it('without files when thresholds are met', sinon.test(function() {
            this.stub(console, 'log');
            this.stub(path, 'relative').returns('test.js');
            this.stub(fs, 'readFileSync').returns([
                'var test = function(value) {',
                '    if (!value) return false;',
                '    return true;',
                '};'
            ].join('\n'));

            reporter.writeReport({
                getFinalCoverage: function() { return {
                    '/path/test2.js': coverage2
                }; }
            });

            var expectedSummary = [
                'Coverage report',
                '---------------------------------------------------------------------------------',
                ' Lines      | 100% coverage (threshold 100%) | All files passed (threshold 100%) ',
                ' Statements | 100% coverage (threshold 100%) | All files passed (threshold 100%) ',
                ' Functions  | 100% coverage (threshold 100%) | All files passed (threshold 100%) ',
                ' Branches   | 100% coverage (threshold 100%) | All files passed (threshold 100%) ',
                '---------------------------------------------------------------------------------',
                ''
            ].join('\n');

            assert.equal(console.log.callCount, 1);
            assert.equal(format.strip(console.log.getCall(0).args[0]), expectedSummary);
        }));
    });
});
