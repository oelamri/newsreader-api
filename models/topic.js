var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var imagePlugin = require('./plugins/image');
var _ = require('underscore');
var regexp = require('../services/regexp');
var FormValidation = require('../services/form-validation');
var completions = require('./plugins/completions');
var publicJSON = require('./plugins/public-json');
const Schema = mongoose.Schema;

var topicSchema = new Schema({

    name: String,

    hashtag: String,

    picture: {
        large: String,
        medium: String,
        original: String
    },

    creatorId: Schema.Types.ObjectId,

    googleData: String,

    checks: {
        isApproved: {
            type: Boolean,
            default: false
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

topicSchema.methods = {};

topicSchema.statics = {
    getIdName: function getIdName() {
        return 'topicId';
    },
    getCollectionName: function getCollectionName() {
        return 'topics';
    }
};

topicSchema.plugin(completions, {handle: 'hashtag', searchOn: ['hashtag', 'name']});
topicSchema.plugin(publicJSON, {multisetFields: ['image', 'name', 'hashtag']});


module.exports = mongoose.model('Topic', topicSchema);
