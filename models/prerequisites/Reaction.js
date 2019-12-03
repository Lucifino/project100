const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const REACTION_SCHEMA = new Schema({
  _id: false,
  type: {
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

module.exports = REACTION_SCHEMA;