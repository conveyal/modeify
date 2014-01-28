/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Expose `schema`
 */

var schema = module.exports = new mongoose.Schema({

});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Campaign`
 */

var Campaign = module.exports = mongoose.model('Campaign', schema);
