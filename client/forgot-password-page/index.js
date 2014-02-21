/**
 * Dependencies
 */

var debug = require('debug')('forgot-password-page');
var request = require('request');
var template = require('./template.html');
var value = require('value');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * Send password change request
 */

View.prototype.sendChangeRequest = function(e) {
  e.preventDefault();
  var email = value(this.find('#email'));
  var self = this;
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (res.ok) {
      window.alert(
        'Check your inbox for instructions to change your password.');
    } else {
      window.alert(err || res.text ||
        'Failed to send change password request.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();

  next();
};
