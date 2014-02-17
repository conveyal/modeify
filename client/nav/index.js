/**
 * Dependencies
 */

var template = require('./template.html');
var config = require('config');
var create = require('view');

/**
 * Nav
 */

var Nav = module.exports = create(template);

/**
 * Name
 */

Nav.prototype.name = function() {
  return config.name();
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
