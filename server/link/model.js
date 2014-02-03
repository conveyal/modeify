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
    ref: 'Organization'
  },
  _commuter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  opts: mongoose.Schema.Types.Mixed
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Link`
 */

var Link = module.exports = mongoose.model('Link', schema);
