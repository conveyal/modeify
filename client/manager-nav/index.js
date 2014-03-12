/**
 * Dependencies
 */

var template = require('./template.html');
var config = require('config');
var page = require('page');
var view = require('view');

/**
 * Nav
 */

var Nav = module.exports = view(template);

/**
 * Application Name
 */

Nav.prototype.application = function() {
  return config.application();
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

/**
 * Logout
 */

Nav.prototype.logout = function() {
  this.model.logout(function() {
    page('/manager');
  });
};
