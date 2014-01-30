
/**
 * Dependencies
 */

var model = require('model');

/**
 * Session
 */

var Session = model('Session')
  .attr('isAdmin')
  .attr('isLoggedIn');

/**
 * Expose `session`
 */

window.session = module.exports = new Session({
  isAdmin: false,
  isLoggedIn: false
});
