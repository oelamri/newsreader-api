const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const imagePlugin = require('./plugins/image');
const _ = require('underscore');
const FormValidation = require('../services/form-validation');
const completions = require('./plugins/completions');
const publicJSON = require('./plugins/public-json');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const userSchema = new Schema({

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
            name: String,
            username: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        facebook: {
            id: String,
            name: String,
            username: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        linkedin: {
            id: String,
            name: String,
            username: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        }
    },

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
    generateHash: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    validPassword: function (password) {
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
        'checks.inBeta': true
    }
});

userSchema.plugin(imagePlugin, {required: false});

userSchema.plugin(publicJSON, {
    publicFields: ['username', 'fullname', 'picture'],
    multisetFields: ['username', 'fullname', 'picture']
});

module.exports = mongoose.model('User', userSchema);
