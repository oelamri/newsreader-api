var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var express = require('express');
var router = express.Router();
var base64url = require('base64url');
var passport = require('passport');
const request = require('request');

router.get('/unlink', function (req, res) {
    var user = req.user;
    user.google.token = null;
    user.save(function (err) {
        res.redirect('/profile');
    });
});

module.exports = router;