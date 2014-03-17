/**
 * Dependencies
 */

var mongoose = require('../mongo');

/**
 * Expose `schema`
 */

var schema = module.exports = new mongoose.Schema({

});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));
