const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const imagePlugin = require('./plugins/image');
const _ = require('underscore');
const completions = require('./plugins/completions');
const publicJSON = require('./plugins/public-json');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    followerId: Schema.Types.ObjectId,

    kind: String, // user or topic

    followeeId: Schema.Types.ObjectId, // topicId or userId

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

module.exports = mongoose.model('Follow', userSchema);
