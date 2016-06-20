//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoConfig = lectalEnv.mongodb;



var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


mongoose.connect(mongoConfig.url);

autoIncrement.initialize(mongoose.connection);


var User = require('../models/user');

var user = new User({username:'guest123','password':'guest123pwd'});

user.save(function(err,model){

    console.log(err,model);

    process.exit();

});