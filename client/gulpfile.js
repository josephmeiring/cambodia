var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
// var livereload = require('gulp-livereload');
var debug = require('gulp-debug');
var connect = require('gulp-connect');

var paths = {
  js: ['./js/**/*.js'],
  css: ['./css/**/*.css'],
};

gulp.task('default', ['build']);

gulp.task('connect', function() {
  connect.server({
    // root: 'app',
    livereload: true
  });
});

gulp.task('clean', function (done) {
  gutil.log("cleaning");
  return gulp.src('./build')
           .pipe(clean({force: true}));
});

gulp.task('build', ['clean'], function(cb) {

  gulp.src(paths.css)
    .pipe(concat('dist.css'))
    .pipe(gulp.dest('./build'));

  gulp.src(paths.js)
    .pipe(debug())
    .pipe(concat('dist.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(connect.reload());

  cb(null);
});
 
gulp.task('watch', function() {
  gulp.watch([paths.js, paths.css], ['clean', 'build']);
});

gulp.task('default', ['connect', 'watch']);

