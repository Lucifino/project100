const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const REACTION_SCHEMA = require('../prerequisites/Reaction');
const COMMENT_SCHEMA = require('../prerequisites/Comment');

const POST_SCHEMA = new Schema({
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: 'USER',
    required: true
  },
  source_id: {
    type: Schema.Types.ObjectId,
    ref: 'USER',
    required: true
  },
  content: {
    type: String,
    required: true,
    default: '',
  },
  comments: [COMMENT_SCHEMA],
},
  {
    timestamps: true 
  }
)

const POST = mongoose.model('POST', POST_SCHEMA);
module.exports = POST;