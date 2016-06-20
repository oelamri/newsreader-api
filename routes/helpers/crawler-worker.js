//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');

//#core
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var async = require('async');
var http = require('http');
var domain = require('domain');

//helpers
var imagesHelper = require('./images-helper');

//#constants
var MIN_PIXEL_COUNT = 300;
var DESIRED_IMAGE_COUNT = 15;


process.on('uncaughtException', function (err) {
    process.send({
        msg: 'fatal',
        error: err.stack,
        workId: -1
    });
});

process.on('message', function (msg) {


    if (msg.msg.action === 'run') {

        log.debug('crawler worker id:', msg.__poolioWorkerId);

        setImmediate(function () {
            if (global.gc) {
                global.gc();
            }
            process.send({
                msg: 'return/to/pool',
                workId: msg.workId,
                result: null
            });
        });

        domain.create().on('error', function (err) {
            log.error(err);
            process.send({
                msg: 'error',
                workId: msg.workId,
                error: err.stack
            });
        }).run(function () {
            run(msg, this);
        });

    }
    else {
        process.send({
            msg: 'return/to/pool',
            workId: msg.workId,
            error: 'worker sent an unexpected message - ' + msg,
            result: null
        });
    }
});

function checkBasics(str) {

    if (!str) {
        return false;
    }
    else {
        str = String(str);
    }


    if (str.toUpperCase().endsWith('.GIF')) {
        return false;
    }

    if (str.toUpperCase().indexOf('THUMB') > 0 ||
        str.toUpperCase().indexOf('ICON') > 0 ||
        str.toUpperCase().indexOf('AD.DOUBLECLICK') > 0) {
        return false;
    }

    return true;

}


function findWidthFromString(str) {

    if (!str) {
        return -1;
    }
    else {
        str = String(str);
    }

    var index1 = null;
    var index2 = null;
    var num = null;

    if ((index1 = str.indexOf('w=')) > 0) {
        index2 = str.substr(index1 + 2).indexOf('&');
        if (index2 < 0) {
            index2 = str.substr(index1).length - 1;
        }
        num = Number(str.substr(index1 + 2, index2));
        if (Number.isInteger(num)) {
            return num;
        }
        else {
            return -1;
        }
    }
    else if ((index1 = str.indexOf('width=')) > 0) {
        index2 = str.substr(index1 + 6).indexOf('&');
        if (index2 < 0) {
            index2 = str.substr(index1).length - 1;
        }
        num = Number(str.substr(index1 + 6, index2));
        if (Number.isInteger(num)) {
            return num;
        }
        else {
            return -1;
        }
    }
    else if ((index1 = str.indexOf('/max/')) > 0) {
        index2 = str.substr(index1 + 5).indexOf('/');
        if (index2 < 0) {
            return -1;
        }
        var sub = str.substr(index1 + 5, index2);
        num = Number(sub);
        if (Number.isInteger(num)) {
            return num;
        }
        else {
            return -1;
        }
    }
    else {
        if (str.endsWith('.jpg') ||
            str.endsWith('.jpeg') ||
            str.endsWith('.bmp') ||
            str.endsWith('.png')) {

            return MIN_PIXEL_COUNT + 1;
        }
        else {
            return -1;
        }
    }
}


function run(msg, d) {

    var workId = msg.workId;
    var url = msg.msg.url;
    var domain = msg.msg.domain;

    function prependDomainToURL(input) {
        if (input && input.toUpperCase().indexOf('HTTP') !== 0) {
            return String('http://' + domain + '/' + input).replace(/([^:]\/)\/+/g, "$1"); //replace all instances of double slash // except first instace as in http://
        }
        else {
            return input;
        }
    }

    request(url, function (err, resp, body) {

        if (err) {
            d.exit();
            process.send({
                msg: 'error',
                workId: workId,
                error: err.stack
            });
        }
        else {
            var images = [];

            var $ = cheerio.load(body);


            $('img').filter(function () {


                return (parseInt($(this).attr('src')) >= MIN_PIXEL_COUNT || parseInt($(this).attr('data-width') >= MIN_PIXEL_COUNT) || parseInt($(this).attr('width') >= MIN_PIXEL_COUNT) || parseInt($(this).attr('naturalWidth')) >= MIN_PIXEL_COUNT || findWidthFromString($(this).attr('src')) >= MIN_PIXEL_COUNT ||
                    findWidthFromString($(this).attr('data-src')) >= MIN_PIXEL_COUNT || findWidthFromString($(this).attr('datasrc')) >= MIN_PIXEL_COUNT);

            }).each(function () {

                images.push(this.attribs.src);
                images.push(this.src);
                images.push($(this).src);
                images.push($(this)['data-src']);
                images.push($(this).get(0).src);
                images.push($(this).attr('src'));
                images.push($(this).attr('data-src'));
                images.push($(this).attr('datasrc'));
            });

            $('meta').filter(function () {

                if ($(this).get(0).naturalWidth >= MIN_PIXEL_COUNT || $(this).get(0).width >= MIN_PIXEL_COUNT) {
                    return true;
                }

                if ($(this).attr('data-width') >= MIN_PIXEL_COUNT || $(this).attr('naturalWidth') >= MIN_PIXEL_COUNT || $(this).attr('width') >= MIN_PIXEL_COUNT) {
                    return true;
                }

                return $(this).attr('property') === 'og:image' || findWidthFromString(String($(this).attr('content'))) >= MIN_PIXEL_COUNT

            }).each(function () {
                images.push($(this).attr('content'));
            });

            $('div').filter(function () {

                if ($(this).get(0).naturalWidth >= MIN_PIXEL_COUNT || $(this).get(0).width >= MIN_PIXEL_COUNT) {
                    return true;
                }

                if ($(this).attr('data-width') >= MIN_PIXEL_COUNT || $(this).attr('naturalWidth') >= MIN_PIXEL_COUNT || $(this).attr('width') >= MIN_PIXEL_COUNT) {
                    return true;
                }

                return findWidthFromString(String($(this).attr('data-share-image'))) >= MIN_PIXEL_COUNT;

            }).each(function () {
                images.push($(this).attr('content'));
                images.push($(this).attr('data-src'));
                images.push($(this).attr('src'));
            });


            log.debug('images *before* map:', images);


            //TODO add sort by size here
            var results = _.sample(_.uniq(_.filter(images.map(prependDomainToURL),
                function (item) {
                    if (item == null) {
                        return false;
                    }
                    else {
                        return checkBasics(item);
                    }
                })), DESIRED_IMAGE_COUNT);


            log.debug('results *before* splice:', results);



            process.send({
                msg: 'done',
                workId: workId,
                result: results
            });


        }

    });


}