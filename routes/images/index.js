var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var express = require('express');
var router = express.Router();
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');
var request = require('request');
var checks = require('../../middleware/checks');
var helpers = require('../helpers');
var fs = require('fs');


router.use('/crawl', require('./crawl'));
router.use('/search', require('./search'));
router.use('/suggest', require('./suggest'));
router.use('/delete', require('./delete'));
router.use('/upload', require('./upload'));

module.exports = router;