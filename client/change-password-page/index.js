var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':change-password-page');
var page = require('page');
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
  var password = this.find('#password').value;
  var repeat = this.find('#repeat-password').value;
  if (password !== repeat) return window.alert('Passwords do not match.');

  var key = this.model.key;
  request.post('/users/change-password', {
    change_password_key: key,
    password: password
  }, function(err, res) {
    if (res.ok) {
      alerts.push({
        type: 'success',
        text: 'Login using your new password.'
      });
      page('/manager/login');
    } else {
      debug(err || res.error || res.text);
      window.alert(err || res.text ||
        'Failed to change password. Use the link sent to your email address.'
      );
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View({
    key: ctx.params.key
  });

  next();
};
