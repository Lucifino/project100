const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const COMMENT_SCHEMA = new Schema({
  _id: false,
  content: {
    type: String,
    default: 'LIKE',
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  }
})

module.exports = COMMENT_SCHEMA;