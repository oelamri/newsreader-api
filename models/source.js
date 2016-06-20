const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sourceSchema = new Schema({
  url : String,
  name : String
});

module.exports = mongoose.model('Source', sourceSchema);