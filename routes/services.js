const config = require('univ-config')(module, '*lectal-api*','config/conf');
const express = require('express');
const router = express.Router();
const request = require('request');
const FormValidation = require('../services/form-validation');

router.get('/suggest-images', function (req, res) {
    const url = req.query.url;
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

module.exports = router;