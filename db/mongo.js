//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoConfig = lectalEnv.mongodb;

//#core
var mongoose = require('mongoose');



mongoose.connect(mongoConfig.url, mongoConfig.options, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', function (coll, method, query, doc) {
        log.debug('query executed:', coll, method, query, doc);
    });
}

var db = mongoose.connection;

db.once('open', function () {
    log.info('mongodb connected.');
});


module.exports = db;