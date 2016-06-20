var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var CLOUDINARY_CONFIG = constants.CLOUDINARY;
var URL = require('url');
var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');
var request = require('request');
var checks = require('../../middleware/checks');
var helpers = require('../helpers');
var fs = require('fs');

cloudinary.config(CLOUDINARY_CONFIG);

function cloudinaryResponse(cb) {
    return function (result) { // Result comes back from Cloudinary as saved image object
        if (result.error) {
            cb(result.error);
        }
        else if (result) {
            log.debug('Back from Cloudinary: ', result.publicId, result.url);
            cb(null, result);
        }
        else {
            cb(new Error('No result from Cloudinary'));
        }
    };
}

router.post('/', function (req, res, next) {


    var imageUrl = req.body.imageUrl;

    var $url = null;

    try {
        $url = URL.parse(imageUrl).href;
    }
    catch (err) {
        return next(err);
    }

    helpers.images.uploadImageViaURL($url, function (err, result) {
        if (err) {
            next(err);
        }
        else {
            res.json({success: result});
        }
    });


});

router.post('/:format', function (req, res) {

    var format = req.params.format;

    var imagePath = null;

    if (format === 'base64') {
        var data = req.body.data;
        imagePath = 'data:image/png;base64,' + data;
    }
    else {
        imagePath = req.files[0].filePath;
    }


    var dimensions = null;

    switch (req.params.format) {
        case 'base64':
            dimensions = {
                large: {
                    width: 150,
                    height: 150
                },
                medium: {
                    width: 100,
                    height: 100
                },
                small: {
                    width: 50,
                    height: 50
                }
            };
            break;
        case 'thumbnail':
            dimensions = {
                large: {
                    width: 150,
                    height: 150
                },
                medium: {
                    width: 100,
                    height: 100
                },
                small: {
                    width: 50,
                    height: 50
                }
            };
            break;
        case 'post':
            dimensions = {
                large: {
                    width: 720,
                    height: 405
                },
                medium: {
                    width: 480,
                    height: 270
                },
                small: {
                    width: 100,
                    height: 100
                }
            };
            break;
    }


    /* TODO: Add error handling */
    async.parallel({
        large: function (done) {
            cloudinary.uploader.upload(imagePath, cloudinaryResponse(done), {
                width: dimensions.large.width,
                height: dimensions.large.height,
                crop: 'fill',
                format: 'jpg'
            });
        },
        medium: function (done) {
            cloudinary.uploader.upload(imagePath, cloudinaryResponse(done), {
                width: dimensions.medium.width,
                height: dimensions.medium.height,
                crop: 'fill',
                format: 'jpg'
            });
        },
        small: function (done) {
            cloudinary.uploader.upload(imagePath, cloudinaryResponse(done), {
                width: dimensions.small.width,
                height: dimensions.small.height,
                crop: 'fill',
                format: 'jpg'
            });
        }
    }, function (err, savedImage) {
        res.status(201).json({
            success: {
                large: savedImage.large.url,
                medium: savedImage.medium.url,
                small: savedImage.small.url
            }
        });
    });

});

module.exports = router;