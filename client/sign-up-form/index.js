var Alert = require('alert');
var log = require('log')('sign-up-form');
var request = require('request');
var session = require('session');
var view = require('view');

var View = module.exports = view(require('./template.html'));

View.prototype.anonymous = function() {
  return session.commuter().anonymous();
};

View.prototype.showButton = function(e) {
  var button = this.find('button');
  button.style.display = 'block';
};

View.prototype.submit = function(e) {
  e.preventDefault();
  var alerts = this.find('.alerts');
  alerts.innerHTML = null;

  var email = this.find('input[name=email]').value;
  var button = this.find('button');
  var id = session.commuter()._id();

  button.disabled = true;
  request.post('/commuters/' + id + '/add-email', {
    email: email
  }, function(err, res) {
    if (err) {
      log.warn('%e %s', err);
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to sign up. ' + res.text
      }).el);
      button.disabled = false;
    } else {
      email.remove();
      button.remove();
      alerts.appendChild(Alert({
        type: 'success',
        text: 'Thanks for signing up! An email has been sent to ' + email +
          ' with instructions to confirm your account.'
      }).el);
    }
  });
};
