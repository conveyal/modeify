var mongoose = require('../mongo')

/**
 * Schema
 */

var schema = new mongoose.Schema({
  category: {
    default: 'other',
    type: String
  },
  created_by: mongoose.Schema.Types.ObjectId,
  name: String,
  original_address: String
})

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-geocode'))
schema.plugin(require('../plugins/mongoose-trackable'))

/**
 * Expose `Location`
 */

module.exports = mongoose.model('Location', schema)
