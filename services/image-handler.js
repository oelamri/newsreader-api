/**
 * Created by amills001c on 11/10/15.
 */

//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var CLOUDINARY_CONFIG = constants.CLOUDINARY;

//#core
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var _ = require('underscore');
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');



cloudinary.config(CLOUDINARY_CONFIG);


module.exports = {
	uploadImage: function(path) {
		console.log('The file is HERE: ', path);
		console.log('Uploading to Cloudinary...');
		cloudinary.uploader.upload(path.filePath, function(result) { 
			console.log('Back from Cloudinary...', result); 
		}, { width: 150, height: 150, crop: 'fill', format: 'jpg' });
	}
};