/**
 * Dependencies
 */

var template = require('./template.html');
var create = require('view');

/**
 * Nav
 */

var Nav = module.exports = create(template);

/**
 * Is admin?
 */

Nav.prototype.isAdmin = function() {
  return this.model.isAdmin();
};

/**
 * Is authed?
 */

Nav.prototype.isLoggedIn = function() {
  return this.model.isLoggedIn();
};
