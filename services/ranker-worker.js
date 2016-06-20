//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');

//#core
var _ = require('underscore');
var async = require('async');
var http = require('http');
var domain = require('domain');


//#constants
var GRACE_PERIOD_MILLIS = 259200000;


function finishWork(fn, d) {
    try {
        process.removeListener('uncaughtException', fn);
        d.exit();
    }
    catch (err) {
        //do nothing, no biggie
    }
}


process.on('message', function (data) {

    var workId = data.workId;

    process.on('uncaughtException', sendFatalError);

    function sendFatalError(err) {
        process.send({
            msg: 'fatal',
            error: err.stack || String(err),
            workId: workId,
            result: null
        });
    }

    var d = domain.create();

    d.on('error', function (err) {
        finishWork(sendFatalError, d); //remove listener and exit domain
        process.send({
            msg: 'error',
            error: err.stack,
            workId: workId,
            result: null
        });
    });

    if (data.msg.action === 'run') {

        d.run(function () {
            run();
            setImmediate(()=> {
                if (typeof global.gc === 'function') {
                    global.gc();  //try to force garbage collection before returning worker to pool
                }
                //since this is synchronous work, we should return to pool only after work is done
            });
        });

    }
    else {
        finishWork(sendFatalError, d); //remove listener and exit domain
        process.send({
            msg: 'error',
            workId: workId,
            error: 'worker sent an unexpected message - ' + data,
            result: null
        });
    }

    function run() {

        var posts = data.msg.posts;
        var rankedPosts = rank(posts);

        finishWork(sendFatalError, d); //remove listener and exit domain
        process.send({
            msg: 'done/return/to/pool',
            workId: workId,
            result: rankedPosts
        });

    }

    function rank(posts) {

        return _.sortBy(posts, function (post) {
            return 1 * getRanking(post);
        });

    }

    function getRanking(post) {

        if (!post.dateCreated) {
            return -1000;
        }

        //TODO update this to include information about numberOfViews
        var millis = new Date(post.dateCreated).getTime();  //TODO need to check if this is parsing date correctly

        var currentMillis = Date.now();

        var diff1 = ((millis + GRACE_PERIOD_MILLIS) / currentMillis) - 1;

        var diff2 = currentMillis - millis;

        return (diff1) / (post.upvotes.length + 1) + (post.upvotes.length) / (diff2);

    }


});
