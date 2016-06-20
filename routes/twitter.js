const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const constants = config.get('lectal_constants');
const TWITTER_ORESOFTWARE_CONFIG = constants.TWITTER_ORESOFTWARE;
const express = require('express');
const router = express.Router();
const request = require('request');
const Twit = require('twit');
const User = require('../models/user');
const Checks = require('../middleware/checks');

const twitClient = new Twit({
    consumer_key: TWITTER_ORESOFTWARE_CONFIG.consumer_key,
    consumer_secret: TWITTER_ORESOFTWARE_CONFIG.consumer_secret,
    access_token: TWITTER_ORESOFTWARE_CONFIG.access_token,
    access_token_secret: TWITTER_ORESOFTWARE_CONFIG.access_token_secret
});

const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: 'd5hy6h6xh7546h567x756',
    consumer_secret: 'dsfgfdsgdfgshgdshgt5efc3y4',
    access_token_key: '3185490870-d546y65h5h',
    access_token_secret: 'd4hy45hyhyh6h654'
});

router.post('/oauth', function (req, res, next) {

    const OAuth = require('oauth');
    const oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        'your Twitter application consumer key',
        'your Twitter application secret',
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    oauth.get(
        'https://api.twitter.com/1.1/trends/place.json?id=23424977',
        'your user token for this app',
        'your user secret for this app',
        function (e, data, res) {
            if (e) console.error(e);
            console.log(require('util').inspect(data));
            done();
        });

});

const TwitterX = require('../node-twitter');

var twitterRestClient = new TwitterX.RestClient(
    TWITTER_ORESOFTWARE_CONFIG.consumer_key,
    TWITTER_ORESOFTWARE_CONFIG.consumer_secret,
    TWITTER_ORESOFTWARE_CONFIG.access_token,
    TWITTER_ORESOFTWARE_CONFIG.access_token_secret
);

router.post('/imageStatus', function (req, res, next) {

    twitterRestClient.statusesUpdateWithMedia(
        {
            'status': 'Posting a tweet w/ attached media.',
            //'media[]': ''
            'media[]': 'http://i.huffpost.com/gen/2139408/images/o-SAY-ANYTHING-facebook.jpg'
        },
        function (err, result) {
            if (err) {
                console.error(err);
                next(err);
            }
            else if (result) {
                console.log(result);
                res.json({
                    success: {
                        message: 'successfully posted image to twitter'
                    }
                });
            }
            else {
                console.log(result);
                res.json({
                    unknown: {
                        message: 'uknown posted image to twitter'
                    }
                });
            }
        });

});


router.post('/image', function (req, res, next) {

    const imageURL = req.body.imageURL || 'https://www.robots.com/images/DSC_0003%20%282%29.JPG';

    const params = {
        screen_name: 'the1mills',
        status: 'Lectal running riot in the streets of Siam',
        media_urls: [imageURL]
    };

    client.post('media/upload.json', params, function (err, tweets, response) {


        if (!err) {
            console.log('tweets:', tweets);
            console.log('response:', response);
            res.json({
                success: {
                    message: 'successfully posted image to twitter'
                }
            });
        }
        else {
            console.log('err:', err);
            next(err);
        }
    });

});

router.post('/postImage', function (req, res, next) {

    tuwm.post('FFFF - look (this is a test) around you', 'https://www.robots.com/images/DSC_0003%20%282%29.JPG', function (err, response) {
        if (err) {
            console.log(err);
            return next(err);
        }
        else {

            console.log(response.body);

            var params = {
                screen_name: 'lectal',
                status: 'FFFF : Watch out for(this is a test) the robots',
                media_ids: response.body.media_id_string
            };

            client.post('statuses/update', params, function (err, tweets, response) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                else {
                    console.log('tweets:', tweets);
                    console.log('response.body:', response.body);
                    res.json({
                        success: {
                            message: 'successfully posted image to twitter'
                        }
                    })
                }
            })

        }
    });
});

router.post('/postImageTwitter', function (req, res, next) {

    const status = req.body.status || 'hello jello';
    const imageURL = req.body.imageURL || 'https://www.robots.com/images/DSC_0003%20%282%29.JPG';

    twitter.postMedia({
        status: status,
        media_urls: [imageURL]

    }, function err(err) {
        console.log(err);
        return next(err);

    }, function success(body) {
        console.log('body:', body);
        res.json({
            success: {
                message: body
            }
        })
    });


});

router.post('/status', function (req, res, next) {

    const params = {
        screen_name: 'the1mills',
        status: 'Lectal running riot in the streets of Siam'
    };

    console.log(req.body);

    client.post('statuses/update', params, function (err, tweets, response) {
        if (err) {
            console.error(err);
            return next(err);
        }
        else {
            console.log(tweets);
            console.log(response);
            res.json({
                success: {
                    tweets: tweets
                }
            });
        }


    });

});

router.post('/direct_message/by_user_id/:id', Checks.isLoggedIn, function (req, res, next) {

    const toUserId = req.params.id;
    const text = String(req.body.text);

    User.findOne({_id: toUserId}).lean(true).exec(function (err, result) {

        if (err) {
            next(err);
        }
        else if (result) {

            var params = {
                user_id: result.accounts.twitter.id,
                text: text || "test message 123"
            };

            twitClient.post('direct_messages/new', params, function (err, tweets, response) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                else {
                    res.json({
                        success: {
                            tweets: tweets,
                            response: response
                        }
                    });
                }
            });
        }
        else {
            next(new Error('no user with the id given=' + toUserId));
        }

    });

});


// NOTE: yes

router.put('/update_following_list', function (req, res, next) {

    const user_id = parseInt(req.body.user_id);

    const params = {
        user_id: user_id
    };

    const user = req.user;

    twitClient.get('followers/ids', params, function (err, resp) {
        if (err) {
            console.error(err);
            next(err);
        }
        else if (resp.ids) {

            console.log(resp.ids.length);

            //note: https://docs.mongodb.org/manual/reference/operator/update/push/

            user.update({
                '$push': {
                    'followingUsers': {
                        '$each': resp.ids
                    }
                }

            }, function (err, result) {

                if (err) {
                    next(err);

                }
                else {
                    res.json({
                        success: result
                    });
                }

            });
        }
        else {
            next(new Error('no response'));
        }

    });

});


router.get('/friends_list_cursor', Checks.isLoggedIn, function (req, res, next) {

    //note: https://dev.twitter.com/rest/reference/get/followers/list


    const userId = req.user._id;
    const data = req.lectalQueryData;

    const cursorNum = data.cursorNum;

    const params = {
        user_id: userId,
        count: 30,
        cursor: cursorNum === 0 ? 0 : cursorNum || -1  //default to -1, but allow for falsy 0
    };


    client.get('friends/list', params, function (err, resp) {
        if (err) {
            next(err);
        }
        else if (resp.users) {

            res.json({
                success: resp.users
            });
        }
        else {
            next(new Error('no response'));
        }

    });

});


router.get('/followers_list_cursor', Checks.isLoggedIn, function (req, res, next) {

    //note: https://dev.twitter.com/rest/reference/get/followers/list


    const userId = req.user._id;
    const data = req.lectalQueryData;
    const cursorNum = data.cursorNum;


    const params = {
        user_id: userId,
        count: 30,
        cursor: cursorNum === 0 ? 0 : cursorNum || -1  //default to -1, but allow for falsy 0
    };


    client.get('followers/list', params, function (err, resp) {
        if (err) {
            next(err);
        }
        else if (resp.users) {

            res.json({
                success: resp.users
            });
        }
        else {
            next(new Error('no response'));
        }

    });

});


module.exports = router;

