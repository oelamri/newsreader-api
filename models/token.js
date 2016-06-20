const log = require('lectal-logger');
const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const imagePlugin = require('./plugins/image');
const _ = require('underscore');
const completions = require('./plugins/completions');
const publicJSON = require('./plugins/public-json');
const uuid = require('node-uuid');
const User = require('./user');
const Schema = mongoose.Schema;

const verificationTokenSchema = new Schema({

    token: String,

    userId:  Schema.Types.ObjectId,

    createdBy: Schema.Types.ObjectId,
    dateCreated: {
        type: Date,
        default: Date.now()
    },

    updatedBy: Schema.Types.ObjectId,
    dateUpdated: {
        type: Date,
        default: Date.now()
    }

});


verificationTokenSchema.methods.createVerificationToken = function (userId, done) {

    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.set('userId', userId); //keep this as userId!!
    verificationToken.save(function (err) {
        if (err) {
            return done(err);
        }
        else {
            log.debug('Verification token:', verificationToken);
            return done(null, token);
        }
    });
};

verificationTokenSchema.statics = {

    getIdName: function getIdName() {
        return '_id';
    },

    getCollectionName: function getCollectionName() {
        return 'tokens';
    },

    verifyUser: function (token, cb) {

        verificationTokenModel.findOne({token: token}, function (err, doc) {
            if (err) {
                cb(err);
            }
            else if (doc) {
                User.findOne({_id: doc.userId}, function (err, user) {  // In this case we want userId not _id for the token model
                    if (err) {
                        cb(err);
                    }
                    else if (user) {
                        user.checks.isVerified = true;
                        log.debug('user about to saved after setting verified to true:', user.toObject());
                        user.save(function (err) {
                            if(err){
                                log.error('Error in setting user to verified:', user.toObject());
                            }
                            cb(err);
                        });
                    }
                    else {
                        log.error('No user found in db when looking up verification token.');
                        cb(new Error(' no user found in db'));
                    }
                });
            }
            else {
                cb(new Error('No token in the db / token is expired'));
            }
        });
    }
};

var verificationTokenModel = module.exports = mongoose.model('VerificationToken', verificationTokenSchema);

