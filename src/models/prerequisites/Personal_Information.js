const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PERSONAL_INFORMATION = new Schema({
  _id: false,
  first_name: {
    type: String,
    required: true
  },
  middle_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  birthday: {
    type: Date,
    required: true,
  },
  email_address: {
    type: String,
    required: true,
  },
  
})

module.exports = PERSONAL_INFORMATION;