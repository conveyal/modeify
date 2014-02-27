/**
 * Dependencies
 */

var config = require('config');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Name
 */

View.prototype.name = function() {
  return config.name();
};
