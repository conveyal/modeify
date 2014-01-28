/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({

});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Campaign`
 */

var Campaign = module.exports = mongoose.model('Campaign', schema);
