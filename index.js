'use strict';
var _ = require('lodash-node'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    rimraf = require('gulp-rimraf'),
    rev = require('gulp-rev'),
    livereload = require('gulp-livereload');

    //cache = require('gulp-cache'),
    //imagemin = require('gulp-imagemin'),
    //sourcemaps = require('gulp-sourcemaps');

module.exports = function(gulp, options){
    var defaults = {
        appRoot: './',
        distRoot: 'dist',

        lessRoot: 'styles/less',
        cssRoot: 'styles/css',
        cssDist: 'dist/css',
        cssRevName: 'rev-css.json',

        jsRoot: 'scripts/js',
        jsDist: 'dist/js',
        globalJson: 'global.json',
        jsRevName: 'rev-js.json',

        autoReload: false,
        notify: false,
        showGlobalJS: true, // global.json列表
        sourcemaps: false,
        debug: false
    };
    var op = _.extend(defaults, options);
    if (op.debug) {
        console.log(op);
    }
    op.appRoot = op.appRoot + '/';
    
    var globalList = require(op.appRoot + op.jsRoot +'/global.json');

    // for styles
    gulp.task('styles', function() {
        var stream = gulp.src(op.appRoot + op.lessRoot + '/**/*.less')
            .pipe(less())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(gulp.dest(op.appRoot + op.cssRoot))
            .pipe(minifycss())
            .pipe(gulp.dest(op.appRoot + op.cssRoot));
        if (op.notify) {
            return stream.pipe(notify({
                message: 'less file build complete'
            }));
        } else {
            return stream;
        }
    });

    // for scripts
    gulp.task('scripts', function() {
        if (op.showGlobalJS) {
            console.log('concat global.json:');
            _.each(globalList, function(file){
                console.log('global file: ', file);
            });
        }
        var stream = gulp.src(globalList)
            .pipe(concat('global.js'))
            .pipe(gulp.dest(op.appRoot + op.jsRoot));
        if (op.notify) {
            return stream.pipe(notify({
                message: 'global.js build complete'
            }));
        } else {
            return stream;
        }
    });

    // for images
    gulp.task('images', function() {
        console.log('images task coming soon~');
    });

    // build css
    gulp.task('build-css', function(){
        return gulp.src(op.appRoot + op.lessRoot + '/**/*.less')
            .pipe(less())
            .pipe(minifycss())
            .pipe(rev())
            .pipe(gulp.dest(op.appRoot + op.cssDist))
            .pipe(rev.manifest(op.cssRevName, {
                merge: true
            }))
            .pipe(gulp.dest(op.appRoot + op.distRoot + '/'));
    });

    // build js
    gulp.task('build-js', function(){
        console.log('concat global.json:');
        _.each(globalList, function(file){
            console.log('global file: ', file);
        });
        gulp.src(globalList)
            .pipe(concat('global.js'))
            .pipe(gulp.dest(op.appRoot + op.jsRoot));
        console.log('global.js build completed');
        
        return gulp.src(op.appRoot + op.jsRoot + '/**/*.js')
            //.pipe(concat(''))
            //.pipe(gulp.dest('dist/js'))
            .pipe(uglify())
            .pipe(rev())
            .pipe(gulp.dest(op.appRoot + op.jsDist))
            .pipe(rev.manifest(op.jsRevName, {
                merge: true
            }))
            .pipe(gulp.dest(op.appRoot + op.distRoot));
    });

    // clean
    gulp.task('clean', function() {
        return gulp.src([
            op.appRoot + op.distRoot + '/**/*.*',
            op.appRoot + op.distRoot + '/**/*'
        ])
        .pipe(rimraf({force: true }));
    });

    // watch
    gulp.task('watch', function() {
        if (op.autoReload) {
            livereload.listen();
        }

        gulp.start('styles', 'scripts');

        gulp.watch(op.appRoot + op.lessRoot + '/**/*.less', ['styles']);
        gulp.watch([
            op.appRoot + op.jsRoot + '/**/*.js',
            op.appRoot + op.jsRoot + '/global.json'
        ], ['scripts']);

        //gulp.watch('src/images/**/*', ['images']);

        // when change
        if (op.autoReload) {
            gulp.watch([
                op.appRoot + op.jsRoot + '/**',
                op.appRoot + op.lessRoot + '/**'
            ]).on('change', function(file) {
                livereload.changed(file.path);
            });
        }
    });

    // dev task
    gulp.task('dev', function(){
        gulp.start('watch');
    });

    // build task
    gulp.task('build', ['clean'], function(){
        gulp.start('build-css', 'build-js');
    });

    // default task
    gulp.task('default', ['clean'], function() {
        gulp.start('styles', 'scripts', 'images');
    });
};
