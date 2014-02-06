/**
 * Dependencies
 */

var defaults = require('model-defaults');
var model = require('model');

/**
 * Session
 */

var Session = model('Session')
  .use(defaults({
    isAdmin: false,
    isLoggedIn: false
  }))
  .attr('isAdmin')
  .attr('isLoggedIn');

/**
 * Expose `session`
 */

window.session = module.exports = new Session();
