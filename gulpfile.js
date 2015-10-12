var gulp = require('gulp');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var del = require('del');
var path = require('path');

var NAME = 'angular-money-directive';
var DEST = 'dist/';

gulp.task('dist', function () {
  return gulp.src(NAME + '.js')
    .pipe(ngAnnotate())

    // dist/angular-money-directive.js
    .pipe(gulp.dest(DEST))

    // .min.js + .min.js.map
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.init())
      .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DEST));
});

gulp.task('clean', function () {
  return del(DEST);
});

gulp.task('build', ['clean', 'dist']);
