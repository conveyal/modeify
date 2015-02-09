var log = require('./client/log')('login-page');
var page = require('page');
var request = require('./client/request');
var session = require('session');
var view = require('view');

/**
 * Create `View`
 */

var View = view(require('./template.html'));

/**
 * On button click
 */

View.prototype.login = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var password = this.find('#password').value;
  var self = this;

  session.logout(function(err) {
    log('logged out %e', err);
    request.post('/commuter-login', {
      email: email,
      password: password
    }, function(err, res) {
      if (res.ok) {
        session.login(res.body);
      } else {
        window.alert(res.text || 'Failed to login.');
      }
    });
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();
  next();
};
