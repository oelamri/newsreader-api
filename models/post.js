const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const imagePlugin = require('./plugins/image');
const _ = require('underscore');
const User = require('./user');
const FormValidation = require('../services/form-validation');
const UrlShortener = require('../services/url-shortener');
const publicJSON = require('./plugins/public-json');
const Schema = mongoose.Schema;

const postSchema = new Schema({


    link: {
        type: String
    },

    shortLink: String,

    summary: [{
        kind: String,
        id: Schema.Types.ObjectId,
        content: String,
        _id: false
    }],

    string: String,


    picture: {
        medium: String,
        large: String,
        square: String
    },

    posterId: Schema.Types.ObjectId,

    versions: [{
        summary: [{
            kind: String,
            id: Schema.Types.ObjectId,
            content: String,
            _id: false
        }],

        string: String,

        createdBy: Schema.Types.ObjectId, // Whoever edited the post
        dateCreated: {
            type: Date,
            default: Date.now()
        },

        _id: false
    }],

    upvotes: [{
        userId: Schema.Types.ObjectId,
        dateCreated: {
            type: Date,
            default: Date.now()
        },
        _id: false
    }],

    upvoteCount: {
        type: Number,
        default: 0
    },

    checks: {
        isFrontpage: {
            type: Boolean,
            default: false
        },

        isGraphic: {
            type: Boolean,
            default: false
        },

        hasSensitiveContent: {
            type: Boolean,
            default: false
        },

        isHidden: {
            type: Boolean,
            default: false
        }
    },

    viewCount: {
        type: Number, // Update this value for any view, does not have to be unique view
        default: 0
    },

    createdBy: Schema.Types.ObjectId, // Whoever posted the post
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

postSchema.methods = {};

postSchema.statics = {
    getIdName: function getIdName() {
        return '_id';
    },
    getCollectionName: function getCollectionName() {
        return 'posts';
    }
};

// Returns a user object of the user who posted this post
postSchema.virtual('poster').get(function () {
    return this._poster || (this._poster = User.find({_id: this.posterId}).exec());
});

postSchema.pre('validate', function (next) {
    this.dateCreated = this.dateCreated || new Date();
    this.dateUpdated = new Date();
    next();
});

postSchema.pre('validate', function (next) {
    var self = this;
    if (this.shortUrl || !this.url) {
        return next();
    }
    UrlShortener.shorten(this.url, function (err, shortUrl) {
        if (!err && shortUrl) {
            self.shortUrl = shortUrl;
        }
        next();
    });
});

postSchema.plugin(publicJSON, {multisetFields: ['picture', 'summary', 'string', 'url']});

module.exports = mongoose.model('Post', postSchema);
