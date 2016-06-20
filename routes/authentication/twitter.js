var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var express = require('express');
var router = express.Router();
var base64url = require('base64url');
var passport = require('passport');


router.get('/login', passport.authenticate('twitter', {session: true}), function (req, res) {

});


router.get('/callback',
    passport.authenticate('twitter', {
        session: true,
        failureRedirect: '/'
    }),
    function (req, res, next) {
        if (req.user.checks.isSetup) {
            res.redirect('/');  //TODO: redirect to the actually desired url instead of just root
        }
        else {
            res.redirect('/setup');  //TODO: redirect to the actually desired url instead of just root
        }
    }
);


module.exports = router;