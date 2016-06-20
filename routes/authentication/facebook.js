var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var express = require('express');
var router = express.Router();
var base64url = require('base64url');
var passport = require('passport');
const request = require('request');
var Checks = require('../../middleware/checks');

router.get('/connect', passport.authorize('facebook', {
    scope: ['email', 'publish_actions']
}));

router.get('/callback', Checks.isLoggedIn,
    passport.authorize('facebook', {
        failureRedirect: '/fail'
    }), function (req, res, next) {
        res.render('auto-close.ejs', {});
    }
);


router.get('/unlink', Checks.isLoggedIn, function (req, res) { //TODO should be isSetup
    var user = req.user;
    if (user.accounts.facebook && user.accounts.facebook.token) {
        user.accounts.facebook.token = null;
        user.save(function (err) {
            if (err) {
                log.error(err);
            }
            res.redirect('/profile'); //TODO: make redirect to user.username instead...?
        });
    }
    else {
        res.redirect('/profile'); //TODO: make redirect to user.username instead...?
    }
});

module.exports = router;