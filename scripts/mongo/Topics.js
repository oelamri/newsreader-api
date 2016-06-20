//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoConfig = lectalEnv.mongodb;

//#core
var async = require('async');

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


mongoose.connect(mongoConfig.url);

autoIncrement.initialize(mongoose.connection);


var Topic = require('../../models/topic');

Topic.find({}).exec(function(err,models){
    if(err){
        throw err;
    }
    else{

        async.eachSeries(models,function(model,cb){

            setTimeout(function(){
                model.update({dateCreated:new Date()},function(err,msg){
                    cb(err,msg);
                });
            },1100);

        }, function complete(err){
            if(err){
                console.error(err);
            }
            else{
                console.log('done');
            }
        })

    }

});