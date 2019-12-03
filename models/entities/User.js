const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PERSONAL_INFORMATION = require('../prerequisites/Personal_Information');

const USER_SCHEMA = new Schema({
  personal_information: PERSONAL_INFORMATION,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  privileges: {
    type: String,
    default: 'DEFAULT',
  },
  is_logged_in: {
    type: Boolean,
    default: false,
  },
  friends: [{
    type: Schema.Types.ObjectId,
    required: false
  }],
  friend_requests: [{
    type: Schema.Types.ObjectId,
    required: false
  }]
})

const USER = mongoose.model('USER', USER_SCHEMA);
module.exports = USER;