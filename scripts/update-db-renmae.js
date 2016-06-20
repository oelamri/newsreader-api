//#logging
var log = require('lectal-logger');

//core
var async = require('async');

//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoConfig = lectalEnv.mongodb;


var mongoose = require('mongoose');

mongoose.connect(mongoConfig.url);


var Model = require('../models/user');

Model.update({
        _id: {
            $exists: true
        }
    },
    {
        $rename: {
            isSetup: 'checks.isSetup',
            isAdmin: 'checks.isAdmin',
            inBeta: 'checks.inBeta',
            isBlocked: 'checks.isBlocked',
            isDisabled: 'checks.isDisabled',
            isVerified: 'checks.isVerified'
        }
    }, {
        multi: true,
        upsert: false

    }).exec(function (err, result) {

    if (err) {
        console.log(err);
        process.exit(1);
    }
    else {
        console.log(result);
        process.exit(0);
    }

});