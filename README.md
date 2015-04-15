# Istanbul text-full reporter
Text based coverage reporter for Istanbul code coverage

## With istanbul

To register and use with istanbul:

    var report = require('istanbul-text-full-reporter');
    istanbul.Report.register(report);

    var reporter = new istanbul.Reporter();
    reporter.add('text-full');
    reporter.write(collector, false, function() {
        console.log('Report written');
    });

You can also provide options to the reporter:

    var reporter = new istanbul.Reporter({
        root: '/path/to/project'
        thresholds: {
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
        }
    });

- `root` defines the project root, file paths are shown relative to this directory, defaults to the process directory
- `thresholds` can be defined with positive percentages or negative values (for number of allowed coverage gaps), defaults to 100% for all thresholds


## With gulp istanbul

Add as a value in the reporter array option:

    var report = require('istanbul-text-full-reporter');
    gulp.src(['example.js'])
        .pipe(mocha())
        .pipe(gulpIstanbul.writeReports({
            reporters: [report]
        }));
