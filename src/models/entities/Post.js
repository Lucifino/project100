const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const REACTION_SCHEMA = require('../prerequisites/Reaction');

const POST_SCHEMA = new Schema({
  author: {
    type: String,
    required: true
  },
  destination_wall: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    default: '',
  }
},
  {
    timestamps: true 
  }
)

const POST = mongoose.model('POST', POST_SCHEMA);
module.exports = POST;