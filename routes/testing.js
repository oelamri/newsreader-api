const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const constants = config.get('lectal_constants');
const TWITTER_ORESOFTWARE_CONFIG = constants.TWITTER_ORESOFTWARE;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const Twit = require('twit');
const request = require('request');
const Facebook = require('facebook-node-sdk');


const facebook = new Facebook({
    appID: 'YOUR_APP_ID',
    secret: 'YOUR_APP_SECRET'
});


function makeTwit() {
    return new Twit({
        consumer_key: TWITTER_ORESOFTWARE_CONFIG.consumer_key,
        consumer_secret: TWITTER_ORESOFTWARE_CONFIG.consumer_secret,
        access_token: TWITTER_ORESOFTWARE_CONFIG.access_token,
        access_token_secret: TWITTER_ORESOFTWARE_CONFIG.access_token_secret
    });
}


router.post('/fb', function (req, res) {

    facebook.api('/olegzandr', function (err, data) {
        if (err) {
            res.json({
                error: err.toString()
            });
        }
        else {
            res.json({
                success: data
            });
        }
    });

});

router.post('/twitter', function (req, res, next) {

    const imageUrl = req.body.imageUrl;

    request.get({

        url: imageUrl,
        encoding: 'base64'

    }, function (err, response, body) {

        if (err) {

            res.json({
                error: String(err)
            });

        }
        else {
            // first we must post the media to Twitter 
            makeTwit().post('media/upload', {
                    media_data: body
                },
                function (err, data, response) {

                    // now we can reference the media and post a tweet (media will attach to the tweet)
                    const mediaIdStr = data.media_id_string;
                    const params = {
                        status: 'loving life #nofilter',
                        media_ids: [mediaIdStr]
                    };

                    makeTwit().post('statuses/update', params, function (err, data, response) {
                        if (err) {
                            next(err);
                        }
                        else {
                            res.status(200).json({success: data});
                        }
                    });
                });
        }

    });
});


router.post('/email', function (req, res, next) {

    const destEmail = req.body.destEmail;

    const email = {
        from: 'cooper@backyard.com',
        to: destEmail,
        template: {
            ID: 'd1653917-2ec5-4520-9df5-5b3b616c0af6'
        },
        subject: 'Woof',
        text: 'I am starving haven\'t eaten in days',
        html: '<b>I am starving haven\'t eaten in days</b>'
    };

    sendgridEmail.sendMail(email, function (err, info) {

        if (err) {
            console.error(err);
            next(new Error('error sending email'));
        }
        else {
            res.send({
                success: {
                    message: 'email sent successfully ' + info.response
                }
            });
        }
    });

});


module.exports = router;
