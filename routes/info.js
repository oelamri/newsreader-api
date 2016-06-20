const config = require('univ-config')(module, '*lectal-api*','config/conf');
const express = require('express');
const router = express.Router();
const async = require('async');
const url = require('url');
const request = require('request');
const Checks = require('../middleware/checks');

router.get('/', Checks.isAdmin, function (req, res, next) {

    var response = {};
    response['process.env.NODE_ENV'] = process.env.NODE_ENV;
    response['process.pid'] = process.pid;
    response['process.uptime'] = process.uptime();
    response['process.argv'] = process.argv;
    response['process.config'] = process.config;
    response['process.env'] = process.env;

    req.lectalTemp = {status: 200, data: response};
    next();

});

module.exports = router;