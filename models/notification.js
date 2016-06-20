const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const imagePlugin = require('./plugins/image');
const _ = require('underscore');
const completions = require('./plugins/completions');
const publicJSON = require('./plugins/public-json');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    userId: Schema.Types.ObjectId,

    message: {
        who: [Schema.Types.ObjectId], // An array of user ids
        did: String, // upvote or follow
        what: {
            kind:  String, // post
            id: Schema.Types.ObjectId
        }
    },

    checks: {

        isRead: {
            type: Boolean,
            default: false
        }
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    },

    dateUpdated: {
        type: Date,
        default: Date.now()
    }

});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('Notification', userSchema);
