/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':users-page');
var go = require('go');
var request = require('request');
var User = require('user');
var view = require('view');

/**
 * Create Page
 */

var Page = view(require('./template.html'));
var UserPage = view(require('./user.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new Page();
  User.all(function(err, users, res) {
    if (err || !res.ok) {
      window.alert(err || res.text || 'Failed to load users.');
    } else {
      var tbody = ctx.view.find('tbody');
      users.each(function(user) {
        var page = new UserPage(user);
        tbody.appendChild(page.el);
      });
    }
    next();
  });
};

/**
 * Create
 */

Page.prototype.create = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var page = this;
  var user = new User({
    email: email
  });
  user.save(function(err) {
    if (err) {
      debug(err);
      window.alert('Failed to create user.');
    } else {
      request.post('/users/change-password-request', {
        email: email
      }, function(err, res) {
        if (err || !res.ok) {
          debug(err);
          window.alert('Failed to send new user email.');
        } else {
          alerts.push({
            type: 'success',
            text: 'Created new user.'
          });
          go('/users');
        }
      });
    }
  });
};

/**
 * Delete
 */

UserPage.prototype.destroy = function(e) {
  e.preventDefault();
  if (this.model.email() === User.instance.email()) return window.alert(
    'You cannot delete yourself.');
  if (window.confirm('Delete this user?')) {
    var page = this;
    this.model.destroy(function(err) {
      if (err) {
        debug(err);
        window.alert('Failed to send new user email.');
      } else {
        alerts.push({
          type: 'success',
          text: 'Created new user.'
        });
        go('/users');
      }
    });
  }
};

/**
 * Reset password
 */

UserPage.prototype.resetPassword = function(e) {
  if (window.confirm('Reset user\'s password?')) {
    request.post('/users/change-password-request', {
      email: this.model.email()
    }, function(err, res) {
      if (err || !res.ok) {
        debug(err, res);
        window.alert('Failed to send reset password request.');
      } else {
        alerts.show({
          type: 'success',
          text: 'Reset password request sent.'
        });
      }
    });
  }
};
