var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async');
var http = require('http');
var Pool = require('poolio');
var appRootPath = require('app-root-path');
var URL = require('url');

var Checks = require('../../middleware/checks');


var pool = new Pool({
    filePath: path.resolve(appRootPath + '/routes/helpers/crawler-worker'),
    size: 2
});

process.on('exit', function () {

    log.debug('Attempting to kill all Poolio workers in crawler route...');
    pool.killAllImmediate().on('all-killed', function () {
        log.debug('Killed all workers in crawler module.');
    });

});

router.post('/', function (req, res, next) {

    try {

        var url = req.body.url;
        var domain = req.body.domain;
        url = URL.parse(url);

        if (String(url.href).indexOf('http') !== 0) {
            next(new Error('Lectal error: bad url - "' + url.href + '"'));
        }
        else {
            log.debug('url sent to crawler worker:', url.href);
            pool.any({action: 'run', url: url.href, domain: domain}).then(function (results) {
                res.json({success: results});
            }, function (err) {
                next(err);
            }).catch(function (err) {
                log.error(err);
            });
        }

    }
    catch (err) {
        next(err);
    }

});


module.exports = router;
