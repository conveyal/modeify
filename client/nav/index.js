/**
 * Dependencies
 */

var template = require('./template.html');
var name = require('config').NAME;
var create = require('view');

/**
 * Nav
 */

var Nav = module.exports = create(template);

/**
 * Name
 */

Nav.prototype.name = function() {
  return name;
};

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
