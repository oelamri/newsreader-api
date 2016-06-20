var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var CLOUDINARY_CONFIG = constants.CLOUDINARY;
var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');
var helpers = require('../helpers');
var fs = require('fs');

cloudinary.config(CLOUDINARY_CONFIG);

router.get('/', function (req, res, next) {

    cloudinary.api.delete_resources_by_tag('a', function (results) {
        console.log('Cloudinary remove/delete result:', results);
        if (results.error) {
            res.json({error: results});
        }
        else {
            res.json({success: results});
        }
    });


});

module.exports = router;