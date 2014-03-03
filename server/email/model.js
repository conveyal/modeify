/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Expose `schema`
 */

var schema = module.exports = new mongoose.Schema({
  _campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  _commuter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: Object,
  result: Object
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Email`
 */

var Email = module.exports = mongoose.model('Email', schema);
