var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var express = require('express');
var router = express.Router();
var base64url = require('base64url');


router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));
router.use('/linkedin', require('./linkedin'));
router.use('/twitter', require('./twitter'));
router.use('/fail', require('./fail'));


module.exports = router;