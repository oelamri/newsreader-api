//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');


//#core
var FB = require('fb');
var Twit = require('twit');
var request = require('request');
var http = require('http');
var fs = require('fs');
var URL = require('url');
var assert = require('assert');


//#local modules
var TWITTER_CONFIG = constants.TWITTER;
var LECTAL_TWITTER_TOKENS = constants.LECTAL_TWITTER_TOKENS;

//////////////////////////////////////////////////////

var Twitter = require('twitter');


function TUWM(auth_settings) {
    this.auth_settings = auth_settings;
    this.api_url = 'https://upload.twitter.com/1.1/media/upload.json';
}

TUWM.prototype.post = function (status, imageUrl, callback) {
    var form, r;
    r = request.post(this.api_url, {
        oauth: this.auth_settings
    }, callback);
    form = r.form();
    form.append('status', status);
    return form.append('media', request(imageUrl));
};


function makeTwit(oauthDetails) {
    return new Twit({
        consumer_key: TWITTER_CONFIG.appId,
        consumer_secret: TWITTER_CONFIG.appSecret,
        access_token: oauthDetails.token,
        access_token_secret: oauthDetails.secret
    });
}


var NodeTwitter = require('../node-twitter');

var twitterRestClient = new NodeTwitter.RestClient(
    TWITTER_CONFIG.appId,
    TWITTER_CONFIG.appSecret,
    LECTAL_TWITTER_TOKENS.token,
    LECTAL_TWITTER_TOKENS.secret
);


function postImageToFacebook(user, post, cb) {

    if (!user.accounts && !user.accounts.facebook && !user.accounts.facebook.token) {
        cb(null);
    }
    else {


        request.post({
            url: 'https://graph.facebook.com/v2.5/' + user.accounts.facebook.id + '/feed',
            json: true,
            headers: {},
            qs: {
                access_token: user.accounts.facebook.token,
            },
            body: {
                message: post.string,
                link: post.link
            }
        }, function (err, resp, body) {
            if (err) {
                log.error(err);
            }
            log.debug('facebook sharing response body:', body);
            cb(null);

        });


    }

}


function postToLectalTwitter(post, cb) {

    var statusMessage = [post.string, post.shortUrl].join(' ');

    makeTwit(LECTAL_TWITTER_TOKENS).post('statuses/update', {
        status: statusMessage
    }, function (err, data) {
        cb(err, data);
    });

}



function postToTwitter1(user, post, cb) {

    if (!user.accounts.twitter.token) {
        cb(new Error('Not authenticated with Twitter.'));
    }
    else {

        var parsedUrl;
        try {
            var imgUrl = post.picture.medium || post.picture.large;
            assert(imgUrl);
            parsedUrl = URL.parse(imgUrl);
        }
        catch (err) {
            log.error(err);
            return cb(null);
        }


        twitterRestClient.statusesUpdateWithMedia({
                'status': 'Posting a tweet w/ attached media plain url.',
                'media[]': imgUrl  // this ***works*** we don't need to download the image first
            },
            function (err, result) {
                if (err) {
                    log.error(err);
                }  //we only log the error, we do not handle the error
                else {
                    log.debug('Twitter share result:', result);
                }
                cb(null);

            });
        //});

    }
}





function postToTwitterZ(user, post, cb) {

    log.debug('user twitter token / token secret', user.accounts.twitter.token, user.accounts.twitter.secret);

    var T = new Twit({
        access_token: user.accounts.twitter.token,
        access_token_secret: user.accounts.twitter.secret,
        consumer_key: constants.TWITTER.appId,
        consumer_secret: constants.TWITTER.appSecret,
        timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    });

    T.post('statuses/update', {status: 'hello world!'}, function (err, data, response) {
        if (err) {
            log.error(err);
        }
        log.debug(data);
        cb(null);
    });
}


function postToTwitterX(user, post, cb) {

    if (!user.accounts.twitter || !user.accounts.twitter.token || !user.accounts.twitter.displayName) {
        log.warn(new Error('Not authenticated with Twitter, but attempted to post to social media.'));
        cb(null);
    }
    else {

        var parsedUrl;
        try {
            var imgUrl = post.picture.large || post.picture.medium;
            assert(imgUrl, 'No image passed to twitter share method');
            assert(user.accounts.twitter.token, 'user does not have a twitter token' + JSON.stringify(user));
            assert(user.accounts.twitter.secret, 'user does not have a twitter token secret' + JSON.stringify(user));
            parsedUrl = URL.parse(imgUrl);
        }
        catch (err) {
            log.error(err);
            return cb(null);
        }

        var client = new Twitter({
            access_token_key: user.accounts.twitter.token,
            access_token_secret: user.accounts.twitter.secret
        });



        var params = {
            screen_name: user.accounts.twitter.username,
            status: post.string || 'Lectal running riot in the streets of Siam',
            media_urls: [parsedUrl]
        };

        client.post('media/upload.json', params, function (err, tweets, response) {
            if (err) {
                log.error(err);
            }
            log.debug('twitter tweets:', tweets);
            cb(null)
        });
    }
}


function postToTwitterY(user, post, cb) {

    var TwitterX = require('../node-twitter');

    var twitterRestClient = new TwitterX.RestClient(
        constants.TWITTER.appId,
        constants.TWITTER.appSecret,
        user.accounts.twitter.token,
        user.accounts.twitter.secret
    );

    twitterRestClient.statusesUpdateWithMedia(
        {
            'status': post.string + ' ' + post.link || 'Posting a tweet w/ attached media. ' + post.link,
            //'media[]': ''
            'media[]': post.picture.large || post.picture.medium
        },
        function (err, result) {
            if (err) {
                log.error(err);
            }
            log.debug('TWITTER REST CLIENT RESULT:', result);
            cb(null);
        });

}


function postToLinkedin(user, post, cb) {

    log.info('post.url:', post.url);

    if (!user.accounts || !user.accounts.linkedin || !user.accounts.linkedin.id) {  //check for linkedin token?
        log.warn('User with userId=', user._id, 'does *not* have a linkedin id');
        cb(null);
    }
    else {


        request.post({
            url: 'https://api.linkedin.com/v1/people/~/shares?format=json', //TODO: this needs no user id in the url?
            json: true,
            headers: {
                'Authorization': 'Bearer ' + user.accounts.linkedin.token,
                'Content-Type': 'application/json',
                'x-li-format': 'json'
            },
            qs: {
                oath2_access_token: user.accounts.linkedin.token
            },
            body: {
                visibility: {
                    code: 'anyone'
                },
                comment: post.string + ' ' + post.link
            }
        }, function (err, resp, body) {
            if (err) {
                log.error(err);
            }
            log.debug('linkedin share response body:', body);
            cb(null);
        });
    }
}

function noop(user, post, cb) {

    process.nextTick(function () {
        cb(null);
    });

}

function postToLectalTwitter2(post, cb) {
    var statusMessage = [post.string, post.shortUrl].join(' ');
    console.log("GOING TO TWITTER: ", statusMessage);

    makeTwit(LectalTokens.twitter).post('statuses/update', {status: statusMessage}, function (err, data) {
        if (err) {
            return cb(err);
        }
        cb(null, data);
    });
}


module.exports = {

    postToPlatform: (service) => {

        switch (String(service || '').toLowerCase()) {
            case 'linkedin':
                return postToLinkedin;
                break;
            case 'facebook':
                return postImageToFacebook;
                break;
            case 'twitter':
                return postToTwitterY;
                break;
            default:
                log.error('non matching service name - ' + service);
                return null;
        }
    }
};
