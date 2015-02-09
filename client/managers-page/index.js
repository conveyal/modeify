var alerts = require('alerts');
var log = require('./client/log')('managers-page');
var page = require('page');
var request = require('./client/request');
var session = require('session');
var User = require('user');
var view = require('view');

/**
 * Create View
 */

var View = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Managers Page'
});
var ManagerView = view(require('./manager.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();
  User.query({
    $query: 'type:administrator OR type:manager'
  }, function(err, managers, res) {
    if (err || !res.ok) {
      log.error(err || res.error || res.text);
      window.alert(err || res.text || 'Failed to load managers.');
    } else {
      var tbody = ctx.view.find('tbody');
      managers.each(function(user) {
        if (user.email() === session.user().email()) return;
        var view = new ManagerView(user);
        tbody.appendChild(view.el);
      });
    }
    next();
  });
};

/**
 * Create
 */

View.prototype.create = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var user = new User({
    email: email,
    type: 'manager'
  });
  user.save(function(err) {
    if (err) {
      log.error(err);
      window.alert('Failed to create manager.');
    } else {
      alerts.push({
        type: 'success',
        text: 'Created new manager.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Delete
 */

ManagerView.prototype.destroy = function(e) {
  e.preventDefault();
  if (window.confirm('Delete this manager?')) {
    this.model.destroy(function(err) {
      if (err) {
        log.error(err);
        window.alert('Failed to delete manager.');
      } else {
        alerts.push({
          type: 'success',
          text: 'Created new manager.'
        });
        page('/manager/managers');
      }
    });
  }
};

/**
 * Reset password
 */

ManagerView.prototype.resetPassword = function(e) {
  if (window.confirm('Reset user\'s password?')) {
    request.post('/users/change-password-request', {
      email: this.model.email()
    }, function(err, res) {
      if (err || !res.ok) {
        log.error(err || res.error || res.text);
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

/**
 * Make admin
 */

ManagerView.prototype.makeAdmin = function(e) {
  this.switchTo('administrator', function(err) {
    if (err) {
      log.error(err);
    } else {
      alerts.push({
        type: 'success',
        text: 'Manager now has administrator access.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Remove admin
 */

ManagerView.prototype.removeAdmin = function(e) {
  this.switchTo('manager', function(err) {
    if (err) {
      log.error(err);
    } else {
      alerts.push({
        type: 'success',
        text: 'Manager no longer has administrator access.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Switch to
 */

ManagerView.prototype.switchTo = function(to, fn) {
  this.model.type(to);
  this.model.save(fn);
};

/**
 * Is Admin?
 */

ManagerView.prototype.isAdmin = function() {
  return this.model.type() === 'administrator';
};
ManagerView.prototype.isNotAdmin = function() {
  return this.model.type() !== 'administrator';
};
