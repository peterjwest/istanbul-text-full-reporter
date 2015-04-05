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


## With gulp istanbul

Add as a value in the reporter array option:

    var report = require('istanbul-text-full-reporter');
    gulp.src(['example.js'])
        .pipe(mocha())
        .pipe(gulpIstanbul.writeReports({
            reporters: [report]
        }));
