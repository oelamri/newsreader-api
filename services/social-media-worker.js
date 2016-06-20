//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');

//#core
var _ = require('underscore');
var async = require('async');
var http = require('http');
var domain = require('domain');
var assert = require('assert');

//#constants


process.on('message', function (data) {

    var workId = data.workId;
    var msg = data.msg;

    assert(workId);

    process.on('uncaughtException', onUncaughtException);

    var caught = false;

    function onUncaughtException(err) {
        if(!caught){
            caught = true;
            process.removeListener(onUncaughtException);
            process.send({
                msg: 'fatal',
                error: err.stack,
                workId: workId
            });
        }
    }

    var d = domain.create();

    d.on('exit',function(){
        process.removeListener(onUncaughtException);
    });

    d.on('error', function (err) {
        this.exit();
        log.error(err);
        process.send({
            msg: 'error',
            error: err.stack,
            workId: workId
        });
    });


    setImmediate(()=> {
        if (typeof global.gc === 'function') {
            global.gc();  //try to force garbage collection before return worker to pool
        }
        process.send({
            msg: 'return/to/pool',
            result: null,
            workId: workId
        });
    });


    switch (msg.action) {
        case 'twitter':
            d.run(function () {
                shareOnTwitter();
            });
            break;
        case 'facebook':
            d.run(function () {
                shareOnFacebook();
            });
            break;
        case 'linkedin':
            d.run(function () {
                shareOnLinkedin();
            });
            break;
        default:
            process.send({
                msg: 'return/to/pool',
                workId: workId,
                error: 'worker sent an unexpected message - ' + data,
                result: null
            });
    }


    function shareOnTwitter() {

    }


    function shareOnFacebook() {

    }


    function shareOnLinkedin() {

    }


});



