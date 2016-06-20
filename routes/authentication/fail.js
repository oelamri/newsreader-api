var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var express = require('express');
var router = express.Router();
var base64url = require('base64url');

router.get('/', function (req, res) {

    res.render('auto-close-error.ejs');

});

module.exports = router;