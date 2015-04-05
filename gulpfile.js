var _ = require('lodash');
var fs = require('fs');
var gulp = require('gulp');
var gulpIstanbul = require('gulp-istanbul');
var istanbul = require('istanbul');
var mocha = require('gulp-mocha');
var path = require('path');
var reporter = require('./index');

gulp.task('coverage', function(cb) {
    return gulp.src(['*.js', 'lib/**/*.js', '!gulpfile.js'])
        .pipe(gulpIstanbul({ includeUntested: true, coverageVariable: '__coverage' }))
        .pipe(gulpIstanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/**/*.js'])
                .pipe(mocha())
                .pipe(gulpIstanbul.writeReports({
                    coverageVariable: '__coverage',
                    reporters: [reporter]
                }));
        });
});
