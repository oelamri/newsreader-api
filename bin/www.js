var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var colors = require('colors');
var async = require('async');
var _ = require('underscore');
var log = require('lectal-logger');
var debug = require('debug')('lectal-api:server');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var lectalEnv = config.get('lectal_env');
var constants = config.get('lectal_constants');
var mongodbConfig = lectalEnv.mongodb;


if (cluster.isMaster) {

    log.info('Runtime NODE_ENV:', process.env.NODE_ENV);

    process.on('uncaughtException', function handleUncaughtException(err) {
        if (log) {
            log.error(err);
        }
        else {
            console.error(err);
        }

        if (process.env.NODE_ENV === 'production') {
            //we are in production, let's cross our fingers
            //set up some alert / email?
            log.error('uncaught exception:', err);
        }
        else {
            throw err; //this should crash the server
        }
    });

    process.on('exit', function exitHook(code) {

        log.warn('exiting with code', code, '...');

    });


    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        log.warn('worker ' + worker.process.pid + ' died');
    });


}
else {

    process.on('uncaughtException', function handleUncaughtException(err) {
        if (log) {
            log.error(err);
        }
        else {
            console.error(err);
        }

        if (process.env.NODE_ENV === 'production') {
            //we are in production, let's cross our fingers
            //set up some alert / email?
            log.error('!!! uncaught exception in production:', err);
        }
        else {
            throw err; //this should crash the server
        }
    });

    process.on('exit', function exitHook(code) {

        log.warn('exiting with code', code, '...');

    });


    //TODO: add ensureIndex check here
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
                startServer();
            }
        });


    function startServer() {

        var app = require('../app');
        var port = lectalEnv.lectal_api_server.port;

        http.createServer(app).listen(port, function (msg) {
            if (msg) {
                log.info(msg);
            }
        }).on('error', onError).on('listening', onListening);

    }


    function onError(error) {
        console.error(error);
    }

    function onListening() {
        var addr = this.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        log.info('Server listening on', bind);
    }

}