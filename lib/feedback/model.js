var mongoose = require('../mongo')
var Schema = mongoose.Schema

/**
 * Schema
 */

var schema = new Schema({
  _commuter: {
    type: Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  feedback: String,
  plan: Schema.Types.Mixed,
  results: Schema.Types.Mixed
})

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'))
schema.plugin(require('../plugins/mongoose-trash'))

/**
 * Expose `Feedback`
 */

module.exports = mongoose.model('Feedback', schema)
