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
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }
})

/**
 * Expose `Ridepool`
 */

module.exports = mongoose.model('Ridepool', schema)
