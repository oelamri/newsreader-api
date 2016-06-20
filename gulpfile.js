//core
var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var socketio = require('socket.io');
var async = require('async');
var _ = require('underscore');
var EE = require('events').EventEmitter;
var colors = require('colors/safe');
var request = require('request');

//header
var defaultHeader = require('./config/default-header');

//gulp plugins
var nodemon = require('gulp-nodemon');
var ijson = require('idempotent-json');

var argv = process.env.argv;

var $node_env = process.env.NODE_ENV;




var tokenGen = require('./services/token-gen');
var token = tokenGen.generateToken({userId: 9});

//TODO fix hot reload backend

gulp.task('watch:hot-reload-back-end', function () {

    //if route file changes, we just reload that one route
    //but if some other module changes, we have to reload all routes because any could be potentially impacted?

    gulp.watch('./routes/**/*.js').on('change', function (file) {

        request({
                method: 'POST',
                json: {
                    path: file.path
                },
                headers: _.extend({}, {
                    'x-lectal-authorization': token
                }),

                uri: 'http://localhost:5001/hot-reload'
            },
            function (err, response, body) {

                if (err) {
                    console.log(colors.red(ijson.parse(err).error));
                }
                else {
                    console.log(colors.blue(ijson.parse(body).success));
                }

            });

    });

});



console.log($node_env);

gulp.task('nodemon', [/*'watch:hot-reload-back-end'*/], function () {

    nodemon({

        script: 'bin/_www',
        ext: 'js',
        ignore: ['public/*', '*.git/*', '*.idea/*', 'gulpfile.js'],
        args: [], //TODO: add these from command line
        nodeArgs: ['--harmony'],
        env: {
            NODE_ENV: $node_env || 'development'
        }

    }).on('restart', []);

});



