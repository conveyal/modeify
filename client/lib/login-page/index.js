/**
 * Dependencies
 */

var debug = require('debug')('login-page');
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

View.prototype.login = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var password = this.find('#password').value;
  var self = this;

  request.post('/login', {
    email: email,
    password: password
  }, function(err, res) {
    if (res.ok) {
      self.emit('go', '/dashboard?success=Welcome back!');
    } else {
      window.alert(err || res.text || 'Failed to login.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  ctx.view = new View();
};
