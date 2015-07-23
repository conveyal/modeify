var mongoose = require('../mongo')
import log from '../log'

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  created_by: mongoose.Schema.Types.ObjectId,
  visibility: {
    type: String,
    default: 'public'
  },
  type: {
    type: String,
    default: 'vanpool'
  },
  from_lat: Number,
  from_lng: Number,
  to_lat: Number,
  to_lng: Number
})

/**
 * Expose `Ridepool`
 */

module.exports = mongoose.model('Ridepool', schema)
