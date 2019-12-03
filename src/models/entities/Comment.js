const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const COMMENT_SCHEMA = new Schema({
  content: {
    type: String,
    default: 'LIKE',
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  post_id: {
    type: Schema.Types.ObjectId,
    ref: 'POST',
    required: true,
  }
})

const COMMENT = mongoose.model('COMMENT', COMMENT_SCHEMA);
module.exports = COMMENT;