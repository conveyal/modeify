var mongoose = require('../mongo');
var Schema = mongoose.Schema;

/**
 * Schema
 */

var schema = new Schema({
  created_by: Schema.Types.ObjectId,
  feedback: String,
  plan: Schema.Types.Mixed,
  results: Schema.Types.Mixed
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));
schema.plugin(require('../plugins/mongoose-trash'));

/**
 * Expose `Feedback`
 */

var Feedback = module.exports = mongoose.model('Feedback', schema);
