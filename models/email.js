const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var emailSchema = new mongoose.Schema({

    userId: Schema.Types.ObjectId,

    email: String,

    checks: {
        isSubscribed: {
            type: Boolean,
            default: true
        }
    },

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

emailSchema.methods = {};

emailSchema.statics = {
    getIdName: function getIdName() {
        return '_id';
    },
    getCollectionName: function getIdName() {
        return 'emails';
    }

};

module.exports = mongoose.model('Email', emailSchema);

