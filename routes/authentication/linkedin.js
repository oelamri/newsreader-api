var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var constants = config.get('lectal_constants');
var LINKEDIN_CONFIG = constants.linkedin;
var express = require('express');
var router = express.Router();
var base64url = require('base64url');
var passport = require('passport');
const request = require('request');
var Checks = require('../../middleware/checks');


router.get('/', Checks.isLoggedIn,
    function (req, res, next) {
        next();
    },
    passport.authorize('linkedin', {
        scope: ['r_emailaddress', 'r_basicprofile', 'w_share'],
        state: 'abcdefg'
    }),
    function (req, res, next) {


    }
);


router.get('/callback', Checks.isLoggedIn,

    passport.authorize('linkedin', {
        failureRedirect: '/auth/fail'
    }), function (req, res, next) {

        log.debug('LINKEDIN_CONFIG.clientId', LINKEDIN_CONFIG.clientId);
        log.debug('auth code', req.query.code);

        var user = req.user;

        request.get({
            url: 'https://api.linkedin.com/v1/people/' + user.accounts.linkedin.id + '/picture-urls::(original)',
            json: true,
            headers: {
                Authorization: 'Bearer ' + user.accounts.linkedin.token
            },
            qs: {
                format: 'json'
            }
        }, function (err, resp, body) {

            if (err) {
                log.error(err);
                res.render('auto-close.ejs', {});
            }
            else {

                log.debug('linkedin body:', body);
                if (Array.isArray(body.values) && user.accounts.linkedin) {
                    user.accounts.linkedin.picture = body.values[0];
                    user.save(function (err) {
                        if (err) {
                            log.error(err);
                        }
                        res.render('auto-close.ejs', {});
                    });
                }
                else {
                    res.render('auto-close.ejs', {});
                }

            }

        });

    }
);

router.get('/unlink', Checks.isLoggedIn, function (req, res) { //TODO should be isSetup
    var user = req.user;
    if(user.accounts.linkedin && user.accounts.linkedin.token){
        user.accounts.linkedin.token = null;
        user.save(function (err) {
            if(err){
                log.error(err);
            }
            res.redirect('/profile');
        });
    }
    else{
        res.redirect('/profile');
    }

});



module.exports = router;