const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;

var handleSchema = new mongoose.Schema({

    kind: String, // user or topic

    handle: String,

    checks: {
        isBlacklisted: {
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

handleSchema.methods = {};
handleSchema.statics = {};

handleSchema.plugin(findOrCreate);

module.exports = mongoose.model('handle', handleSchema);

