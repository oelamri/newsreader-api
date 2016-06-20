const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const express = require('express');
const router = express.Router();
const request = require('request');

const constants = config.get('lectal_constants');
const FACEBOOK_CONFIG = constants.FACEBOOK;

router.get('/facebook_app_access_token', function (req, res) {

    request.get({
        url: 'https://graph.facebook.com/oauth/access_token',
        json: true,
        qs: {
            client_id: FACEBOOK_CONFIG.appId,
            client_secret: FACEBOOK_CONFIG.appSecret,
            grant_type: 'client_credentials'
        }

    }, function (err, resp, body) {

        if (err) {
            res.json({error: err.stack});
        }
        else {
            res.json({success: body});
        }

    });


});


module.exports = router;