var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var express = require('express');
var router = express.Router();
var path = require('path');
var FormValidation = require('../../services/form-validation');
var request = require('request');
var appRootPath = require('app-root-path');
var helpers = require('../helpers');
var fs = require('fs');


router.post('/', function (req, res) {

    var url = req.body.url;

    if (!url || !FormValidation.isValidUrl(url)) {
        return res.status(400).send();
    }

    request(url, function (err, resp, body) {
        if (err) {
            res.json({
                error: err.stack
            });
        }
        else {

            fs.appendFile(path.resolve(appRootPath + '/tmp/crawl_body.txt'), body);

            var arr = (body.match(/<img.*?src=".*"/g) || []).
            concat(body.match(/<img.*?data-src=".*"/g) || []).
            concat(body.match(/<img.*?datasrc=".*"/g) || []).
            concat(body.match(/<div.*?data-src=".*"/g) || []).map(function (str) {
                return str;
            });

            res.json({
                images: arr
            });

        }

    });

});

module.exports = router;