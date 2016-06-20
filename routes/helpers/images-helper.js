//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var CLOUDINARY_CONFIG = constants.CLOUDINARY;

//#core
var _ = require('underscore');
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');

cloudinary.config(CLOUDINARY_CONFIG);

function cloudinaryResponse(cb) {
    return function (result) { // Result comes back from Cloudinary as saved image object
        if (result.error) {
            cb(result.error);
        }
        else if (result) {
            log.debug('Back from Cloudinary:', result.publicId, result.url);
            cb(null, result);
        }
        else {
            cb(new Error('No response from Cloudinary'));
        }
    };
}


module.exports = {

    uploadImageViaURL: function (imageUrl, cb) {

        async.parallel({
            large: function (cb) {

                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 720,
                    height: 405,
                    crop: 'fill',
                    format: 'jpg'
                });
            },
            medium: function (cb) {


                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 480,
                    height: 270,
                    crop: 'fill',
                    format: 'jpg'
                });
            },
            square: function (cb) {

                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 100,
                    height: 100,
                    crop: 'fill',
                    format: 'jpg'
                });
            }
        }, function complete(err, savedImage) {
            if (err) {
                log.error('upload err:', err);
                cb(err);
            }
            else {
                cb(null, {
                    large: savedImage.large ? savedImage.large.url : '(cloudinary null)',
                    medium: savedImage.medium ? savedImage.medium.url : '(cloudinary null)',
                    square: savedImage.square ? savedImage.square.url : '(cloudinary null)'
                });
            }
        });
    },

    uploadOnlyLargeImageViaURL: function (imageUrl, cb) {

        async.parallel({
            large: function (cb) {

                cb = _.once(cb);

                var timeout = false;

                var to = setTimeout(function () {
                    timeout = true;
                    cb(null);
                }, 7000);

                cloudinary.uploader.upload(imageUrl, function cloudinaryResponse(result) {
                    // Result comes back from Cloudinary as saved image object
                    if (!timeout) {
                        clearTimeout(to);

                        if (result.error) {
                            log.error(result.error);
                            cb(null, result);
                        }
                        else {
                            log.debug('Back from Cloudinary: ', result.publicId, result.url);
                            cb(null, result);
                        }
                    }

                }, {
                    width: 700,
                    height: 700,
                    //width: 200,
                    //height: 200,
                    crop: 'fill',
                    format: 'jpg'
                });
            }
        }, function complete(err, savedImage) {
            if (err) {
                log.error('upload err:', err);
                cb(err);
            }
            else {
                if (savedImage.large && savedImage.large.url) {
                    cb(null, {
                        large: savedImage.large.url
                    });
                }
                else if (savedImage.large && savedImage.large.error) {
                    cb(null, {
                        error: savedImage.large.error
                    });
                }
                else {
                    var error = new Error('Unexpected Cloudinary response');
                    log.error(error);
                    cb(null, {
                        error: error.stack
                    });
                }

            }
        });
    }


};