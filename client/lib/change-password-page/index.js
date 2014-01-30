/**
 * Dependencies
 */

var debug = require('debug')('change-password-page');
var request = require('request');
var template = require('./template.html');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * On button click
 */

View.prototype.changePassword = function(e) {
  e.preventDefault();
  var key = this.model.key;
  var password = this.find('#password').value;
  var self = this;

  request.post('/users/change-password', {
    change_password_key: key,
    password: password
  }, function(err, res) {
    if (res.ok) {
      self.emit('go', '/login?success=Login using your new pasword.');
    } else {
      window.alert(err || res.text || 'Failed to change password. Use the link sent to your email address.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  ctx.view = new View({
    key: ctx.params.key
  });
};
