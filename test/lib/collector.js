var _ = require('lodash');
var assert = require('assert');
var collector = require('../../lib/collector');

describe('getMissedLines', function() {
    var coverage = require('../fixtures/coverage');
    assert.deepEqual(collector.getMissedLines(coverage), { '1': 's', '2': 's', '3': 's', '4': 's' });
});
