var config = require('config');
var debug = require('debug')(config.application() + ':commuter-profile');
var modal = require('modal');
var request = require('request');
var spin = require('spinner');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 *
 */

View.prototype.show = function(callback) {
  this.modal = modal(this.el)
    .overlay()
    .closable()
    .show(callback);
};

/**
 * Submit Add Password
 */

View.prototype.submitAddPassword = function() {
  var email = this.email();
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (err) {
      console.error(err);
      window.alert('Error submitting password change request.');
    } else {
      window.alert('An email has been sent to ' + email +
        ' with instructions to add a password.');
    }
  });
};

/**
 * Submit Email Address
 */

View.prototype.submitEmailAddress = function(e) {
  e.preventDefault();
  var email = this.find('input[name=email]').value;
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (err) {
      console.error(err, email);
      window.alert('Failed to add email address.');
    } else {
      window.alert('An email has been sent to ' + email +
        ' with instructions to add a password and confirm your account.');
    }
  });
};

/**
 * Proxy values
 */

View.prototype.anonymous = function() {
  return this.model.commuter._user().anonymous;
};
View.prototype.email = function() {
  return this.model.commuter._user().email;
};
View.prototype.profileComplete = function() {
  return this.model.commuter._user().email_confirmed;
};

/**
 * Hide
 */

View.prototype.hide = function() {
  if (this.modal) this.modal.hide();
};

/**
 * Journey View
 */

View.prototype['journeys-view'] = function() {
  return require('./journey');
};
