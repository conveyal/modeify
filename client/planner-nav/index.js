/**
 * Dependencies
 */

var config = require('config');
var page = require('page');
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

/**
 * Logout
 */

View.prototype.logout = function() {
  this.model.logout(function(err) {
    page('/');
  });
};
