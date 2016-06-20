//TODO: remove all console.log and debug() statements

process.on('uncaughtException', function handleUncaughtException(err) {
    if (log) {
        log.error(err);
    }
    else {
        console.error(err);
    }

    if (process.env.NODE_ENV === 'production') {
        log.error('uncaught exception:', err);
    }
    else {
        throw err; //this should crash the server
    }
});

process.on('exit', function exitHook(code) {

    log.warn('exiting with code', code, '...');

});


var log = require('lectal-logger');
var debug = require('debug')('lectal-api:server');
var http = require('http');
var async = require('async');
var _ = require('underscore');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var lectalEnv = config.get('lectal_env');
var constants = config.get('lectal_constants');
var mongodbConfig = lectalEnv.mongodb;


log.info('Runtime NODE_ENV:', process.env.NODE_ENV);


async.series([

        function (cb) {

            var MongoClient = require('../db/mongo-client');
            MongoClient.MongoClient.connect(mongodbConfig.url, mongodbConfig.options, function (err, db) {
                if (err) {
                    cb(err);
                }
                else {
                    MongoClient.db = db;
                    cb(null);
                }
            });

        },

        function (cb) {

            var db = require('../db/mongo');

            cb = _.once(cb);

            db.on('error', function (err) {
                cb(err);
            });

            db.on('open', function (msg) {
                cb(null, msg);
            });

        },

        function (cb) {

            var models = require('../models');
            async.each(Object.keys(models), function (key, cb) {
                var Model = models[key];
                Model.ensureIndexes(function (err) {
                    cb(err);
                });
            }, function complete(err) {
                cb(err);
            });
        }
    ],
    function complete(err) {
        if (err) {
            throw err;
        }
        else {
            var app = require('../app');
            app.set('port', lectalEnv.lectal_api_server.port);

            var server = require('../servers/http-server').getServer(app);

            server.once('listening', function () {
                log.info('HTTP server is listening on port: ' + app.get('port'));
            });

            server.once('error', function (err) {
                log.error('Web server experienced error ' + err.stack);
            });
        }
    });

