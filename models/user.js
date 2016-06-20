var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var imagePlugin = require('./plugins/image');
var _ = require('underscore');
var FormValidation = require('../services/form-validation');
var completions = require('./plugins/completions');
var publicJSON = require('./plugins/public-json');
var findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({

    email: String,

    password: String,

    username: String,

    fullname: String,

    picture: {
        original: String,
        large: String,
        medium: String
    },

    accounts: {

        twitter: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        facebook: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        linkedin: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        }
    },

    following: [{
        kind: String,
        followeeId: Schema.Types.ObjectId, // topicId or userId
        dateCreated: {
            type: Date,
            default: Date.now()
        },
        _id: false
    }],


    followers: [{
        followerId: Schema.Types.ObjectId,
        dateCreated: {
            type: Date,
            default: Date.now()
        },
        _id: false
    }],

    checks: {

        isVerified: {
            type: Boolean,
            default: false
        },

        isSetup: {
            type: Boolean,
            default: false
        },

        isAdmin: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        isDisabled: {
            type: Boolean,
            default: false
        },

        inBeta: {
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

userSchema.methods = {
    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
};

userSchema.statics = {
    getIdName: function getIdName() {
        return '_id';
    },
    getCollectionName: function getCollectionName() {
        return 'users';
    }
};

userSchema.plugin(findOrCreate);

userSchema.plugin(completions, {
    name: 'fullname',
    handle: 'username',
    id: '_id',
    searchOn: ['fullname', 'username'],
    query: {
        inBeta: true
    }
});

userSchema.plugin(imagePlugin, { required: false });

userSchema.plugin(publicJSON, {
    publicFields: ['username', 'fullname', 'picture'],
    multisetFields: ['username', 'fullname', 'picture']
});

module.exports = mongoose.model('User', userSchema);
