//#logging
var logger = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var serverConfig = config.get('lectal_env').lectal_web_server;

//#core
var _ = require('underscore');
var FileHandler = require('../services/file-handler');
var SocialMedia = require('../services/social-media');
var User = require('../models/user');
var checks = require('../middleware/checks');
var async = require('async');
var FormValidation = require('../services/form-validation');
var request = require('request');

module.exports = function (app) {

    //TODO: use checks.isAdmin?

    app.get('/api/services/suggest-images', function (req, res) {
        var url = req.query.url;
        if (!url || !FormValidation.isValidUrl(url)) {
            return res.status(400).send();
        }

        request(url, function (err, resp, body) {
            res.json({
                images: !err && body && body.match(/<img[^>]+src="([^">]+)/g).map(function (str) {
                    return str.match(/src="([^">]+)/)[1];
                })
            });
        });

    });
};