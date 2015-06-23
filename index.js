'use strict';
var _ = require('lodash-node'),
    clc = require('cli-color'),
    less = require('gulp-less'),
    browserify = require('gulp-browserify'),
    html = require('html-browserify'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    rev = require('gulp-rev'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant');

module.exports = function(gulp, options){
    var defaults = {
        appRoot: './',
        distRoot: 'dist',

        lessRoot: 'styles/less',
        cssRoot: 'styles/css',
        cssDist: 'dist/css',
        cssRevName: 'rev-css.json',

        jsRoot: 'scripts/js',
        jsSource: 'scripts/source',
        jsDist: 'dist/js',
        globalJson: 'global.json',
        jsRevName: 'rev-js.json',

        imgRoot: 'images',
        imgDist: 'dist/img',
        imgRevName: 'rev-img.json',

        separateLib: false,

        templateRoot: 'scripts/template',

        autoReload: false,
        notify: false,
        showGlobalJS: true, // show global.json file list ?
        sourcemaps: false,
        debug: false
    };
    var op = _.extend(defaults, options);

    // for display debug msg
    function debug(msg) {
        return console.log(clc.yellow(clc.bold('debug msg: ') + msg));
    }

    // buildLess
    function buildLess(file){
        file = file || [op.appRoot + op.lessRoot + '/**/*.less'];
        return gulp.src(file)
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(op.appRoot + op.cssRoot));
    }

    // browserify
    function _browserify(file){
        var fileList = [op.appRoot + op.jsSource + '/**/*.js'];
        if (op.separateLib) {
            fileList.push('!' + op.appRoot + op.jsSource + '/lib/**/*.js');
        }
        file = file || fileList;
        return gulp.src(file)
            .pipe(browserify({
                //nobuiltins: 'events querystring',
                //debug: true,
                transform: html,
                insertGlobals: false,
                //ignore: 'jquery', // concat once
                /*resolve: function(mod){
                    console.log('load module:', mod);
                }*/
            }))
            .pipe(gulp.dest(op.appRoot + op.jsRoot));
    }

    if (op.debug) {
        debug(op);
    }
    op.appRoot = op.appRoot + '/';

    var globalList = [];
    try {
        globalList = require(op.appRoot + op.jsSource +'/global.json');
    } catch (e) {
        console.log(clc.red(clc.bold('Error: ') + 'missing global.json'));
        console.log(clc.yellow(clc.bold('Tips: ') + 'create global.json in folder ' + op.jsSource + '/'));
    }

    if (op.debug) {
        debug('globalList file:');
        _.each(globalList, function(file){
            console.log(clc.cyan(clc.bold('global file: '), file));
        });
    }

    // for styles
    gulp.task('styles', function() {
        var stream = buildLess();
        if (op.notify) {
            return stream.pipe(notify({
                message: 'less file build complete'
            }));
        } else {
            return stream;
        }
    });

    // build global.js
    function buildGlobal() {
        if (op.showGlobalJS) {
            if (globalList.length > 0) {
                console.log(clc.magenta('concat global.json:'));
                _.each(globalList, function(file){
                    console.log(clc.cyan(clc.bold('global file: '), file));
                });
            } else {
                console.log(clc.yellow('global scripts list is empty'));
            }
        }

        return gulp.src(globalList)
            .pipe(concat('global.js'))
            .pipe(gulp.dest(op.appRoot + op.jsRoot));
    }

    // for global.js
    gulp.task('globalScript', function(){
        var stream = buildGlobal();
        if (op.notify) {
            return stream.pipe(notify({
                message: 'global.js build complete'
            }));
        } else {
            return stream;
        }
    });

    // for scripts
    gulp.task('scripts', function() {
        var stream = _browserify();
        if (op.notify) {
            return stream.pipe(notify({
                message: 'global.js build complete'
            }));
        } else {
            return stream;
        }
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

    // build global.js
    gulp.task('build-global', function(){
        return buildGlobal();
    });

    // build js
    gulp.task('build-js', ['build-global', 'scripts'], function(){
        return gulp.src([
                op.appRoot + op.jsRoot + '/**/*.js',
                '!' + op.appRoot + op.jsSource + '/lib/**/*.js',
            ])
            .pipe(uglify())
            .pipe(rev())
            .pipe(gulp.dest(op.appRoot + op.jsDist))
            .pipe(rev.manifest(op.jsRevName, {
                merge: true
            }))
            .pipe(gulp.dest(op.appRoot + op.distRoot));
    });

    // build images
    gulp.task('build-images', function() {
        return gulp.src(op.appRoot + op.imgRoot + '/**/*')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                //use: [pngquant()]
            }))
            .pipe(rev())
            .pipe(gulp.dest(op.appRoot + op.imgDist))
            .pipe(rev.manifest(op.imgRevName, {
                merge: true
            }))
            .pipe(gulp.dest(op.appRoot + op.distRoot + '/'));
    });

    // clean dist
    gulp.task('clean', function() {
        return del([
            op.appRoot + op.distRoot + '/**/*.*',
            op.appRoot + op.jsRoot + '/**/*.*'
        ]);
    });

    // watch
    gulp.task('watch', ['styles', 'globalScript', 'scripts'], function() {
        if (op.autoReload) {
            livereload.listen();
        }

        // watch less
        gulp.watch(op.appRoot + op.lessRoot + '/**/*.less', function(file){
            console.log(clc.green(clc.bold('less file ' + file.type + ': '), file.path));
            gulp.start('styles');
            //buildLess(file.path);
        });

        // watch js
        gulp.watch([
            op.appRoot + op.jsSource + '/**/*.js',
            op.appRoot + op.jsSource + '/global.json',
            op.appRoot + op.templateRoot + '/**/*.html'
        ], function(file){
            console.log(clc.green(clc.bold('js file ' + file.type + ': '), file.path));
            gulp.start('scripts');
            //_browserify(file.path);
        });

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
        del([op.appRoot + op.jsRoot + '/**/*']);
        gulp.start('watch');
    });

    // build task
    gulp.task('build', ['clean'], function(){
        gulp.start('build-css', 'build-js', 'build-images');
    });

    // default task
    gulp.task('default', ['clean'], function() {
        gulp.start('watch');
    });
};
