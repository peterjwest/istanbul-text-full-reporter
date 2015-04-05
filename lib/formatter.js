var _ = require('lodash');
var format = require('./bash-format');

var padLeft = function(string, length, pad) {
    return (_.repeat((pad || ' ')[0], length) + string).slice(-length);
};

var formatValue = function(value) {
    return value >= 0 ? value + '%' : -value;
};

var formatThreshold = function(threshold) {
    return '(threshold ' + formatValue(threshold) + (threshold < 0 ? ' gaps' : '') + ')';
};

var formatSummaryItem = function(passed, actual, threshold) {
    return format[passed ? 'green' : 'red'](actual + ' ' + formatThreshold(threshold));
};

var formatTable = function(data) {
    // Find the column widths
    var widths = [];
    data.forEach(function(row) {
        row.forEach(function(item, i) {
            // Find max width, stripping bash formatting
            widths[i] = Math.max(widths[i] || 0, format.strip(item.toString()).toString().length);
        });
    });

    // Table width including column padding
    var tableWidth = widths.reduce(function(a, b) { return a + b; }, 0) + widths.length * 3 - 1;

    // Generate the table
    var table = [];
    table.push(format.grey(_.repeat('-', tableWidth)));
    table.push.apply(table, data.map(function(row) {
        return ' ' + row.map(function(item, i) {
            // Find the string length without bash formatting
            var length = format.strip(item).length;
            return widths[i] > length ? item + _.repeat(' ', widths[i] - length) : item;
        }).join(format.grey(' | ')) + ' ';
    }));
    table.push(format.grey(_.repeat('-', tableWidth)));

    // Output the table
    return table.join('\n');
};

var formatter = module.exports = {
    outputSummary: function(thresholds, summary) {
        // Build table data
        var table = summary.map(function(item) {
            var filesFailed = item.filesFailed.length;
            var overall = formatValue(item.value) + (thresholds.global[item.type] < 0 ? ' gaps' : ' coverage');
            var perFile = filesFailed ? filesFailed + ' files failed' : 'All files passed';

            return [
                _.capitalize(item.type),
                formatSummaryItem(!item.failed, overall, thresholds.global[item.type]),
                formatSummaryItem(!filesFailed, perFile, thresholds.each[item.type])
            ];
        });

        return format.bold('Coverage report') + '\n' + formatTable(table);
    },
    outputFile: function(filename, data, missing) {
        // Select gaps in coverage and their line numbers
        var lines = data.split(/\r\n|\r|\n/).map(function(line, i) {
            // Map missing coverage line numbers and values
            var current = missing[i + 1];
            if (current) {
                return { number: i + 1, value: line };
            }
            // Add gaps between non-consecutive lines
            var previous = missing[i];
            if (!current && previous) {
                return { number: i + 1, gap: true };
            }
        }).filter(_.identity);

        // If there are any lines to report
        if (lines.length) {
            var title = '\n' + format.bold('Missing coverage') + ' in ' + format.red(filename);
            // Work out how much to pad line numbers
            var numberPadding = _.last(lines).number.toString().length;
            var content = lines.map(function(line) {
                var lineNumber = ' ' + padLeft(line.gap ? '~' : line.number, numberPadding) + ' | ';
                return format.grey(lineNumber) + (line.value || '');
            }).join('\n');

            return title + '\n' + content;
        }
    }
};
