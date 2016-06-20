//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoConfig = lectalEnv.mongodb;


//#core
var path = require('path');
var _ = require('underscore');
var Pool = require('poolio');
var appRootPath = require('app-root-path');


/////////////////////////////////////////////////

var pool = new Pool({
    filePath: path.resolve(appRootPath + '/services/ranker-worker'),
    size: 2
});

process.on('exit', function () {

    log.debug('Attempting to kill all Poolio workers in ranker-delegator route...');
    pool.killAllImmediate().on('all-killed', function () {
        log.debug('Killed all workers in ranker-delegator module.');
    });

    //TODO: add setTimeout to wait to kill the workers?

});

//////////////////////////////////////////////////


function rank(posts, isRanked, cb) {

    if (isRanked) {

        pool.any({action: 'run', posts: posts}).then(function resolved(posts) {
            cb(null, posts);
        }, function rejected() {
            cb(null, []);
        }).catch(function (err) {
            log.error(err);
        });

    }
    else {
        cb(null, posts);
    }


}


module.exports = {
    rank: rank
};