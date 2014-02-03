/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  labels: Array,
  opts: mongoose.Schema.Types.Mixed
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-geocode'));
schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = mongoose.model('Commuter', schema);
