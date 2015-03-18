var Alert = require('alert');
var config = require('config');
var log = require('log')('sign-up-form');
var request = require('request');
var session = require('session');
var value = require('value');
var view = require('view');

var View = module.exports = view(require('./template.html'));

View.prototype.applicationName = function() {
  return config.application();
};

View.prototype.anonymous = function() {
  return session.commuter().anonymous();
};

View.prototype.showButton = function(e) {
  this.find('.SignUpForm-submitButton').classList.remove('hidden');
};

View.prototype.submit = function(e) {
  e.preventDefault();
  var $alerts = this.find('.alerts');
  var $email = this.find('input[name=email]');
  var $button = this.find('button');

  var email = value($email);
  var id = session.commuter()._id();

  $alerts.innerHTML = null;
  $button.disabled = true;

  request.post('/commuters/' + id + '/add-email', {
    email: email
  }, function(err, res) {
    if (err) {
      log.warn('%e %s', err);
      $alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to sign up. ' + res.text
      }).el);
      $button.disabled = false;
    } else {
      $email.remove();
      $button.remove();
      $alerts.appendChild(Alert({
        type: 'success',
        text: 'Thanks for signing up! An email has been sent to ' + email +
          ' with instructions to confirm your account.'
      }).el);
      session.commuter().set({
        anonymous: false
      }).save();
    }
  });
};
