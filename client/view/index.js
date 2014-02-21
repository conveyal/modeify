/**
 * Dendencies
 */

var reactive = require('reactive');
var view = require('view');

/**
 * Set up reactive plugins
 */

reactive.use(require('./dropdown'));
reactive.use(require('./each'));
reactive.use(require('reactive-child'));
reactive.use(require('reactive-disabled'));

/**
 * Expose `view`
 */

module.exports = view;
