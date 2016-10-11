var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
// var livereload = require('gulp-livereload');
var debug = require('gulp-debug');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var server = require('gulp-server-livereload');


var paths = {
  js: ['./js/**/*.js'],
  css: ['./css/**/*.css'],
};

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(server({
      livereload: false,
    }));
});

gulp.task('clean', function (done) {
  gutil.log("cleaning");
  return gulp.src('./build/')
           .pipe(clean({force: true}));
});



gulp.task('build', ['clean'], function(cb) {
  
  gulp.src(paths.css)
    .pipe(concat('dist.css'))
    .pipe(gulp.dest('./build'));

  return browserify({
    entries: 'js/index.js',
    debug: true
  })
  .bundle()
  .pipe(source('dist.js'))
  .pipe(gulp.dest('./build/'))
  .pipe(livereload());
  
});
 
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch([paths.js, paths.css], ['build']);
});

gulp.task('default', ['watch', 'webserver']);

