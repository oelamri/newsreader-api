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
var autoIncrement = require('mongoose-auto-increment');


mongoose.connect(mongoConfig.url);
autoIncrement.initialize(mongoose.connection);


var Model = require('../models/user');

Model.find({}).exec(function(err,models){

    if(err){
        console.error(err.stack);
    }
    else{

        async.each(models,function(model,cb){

            if(model._doc.twitter){
                model.update({

                    "accounts.linkedin": model._doc.linkedin,
                    "accounts.facebook": model._doc.facebook,
                    "accounts.twitter": model._doc.twitter,
                    '$unset':{
                        linkedin: '',
                        facebook: '',
                        twitter: ''
                    }
                },  {strict: false}).exec(cb);
            }
            else{
                cb(null);
            }

        }, function complete(err,results){

            if(err){
                console.error(err.stack);
                process.exit(1);
            }
            else{
                console.log('all done');
                process.exit(0);
            }
        });

    }


});