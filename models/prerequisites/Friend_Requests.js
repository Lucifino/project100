const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FRIEND_REQUESTS = new Schema({
  from_user: {
    type: Schema.Types.ObjectId,
    ref: 'USER',
    required: true
  },
  to_user: {
    type: Schema.Types.ObjectId,
    ref: 'USER',
    required: true
  },

},
  {
    timestamps: true 
  }
)

module.exports = FRIEND_REQUESTS;