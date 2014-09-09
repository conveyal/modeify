var Alert = require('alert');
var log = require('log')('commuter-profile');
var modal = require('modal');
var request = require('request');

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
}, function(view, model) {
  view.selectWalkSpeed();
  view.selectBikeSpeed();
});

/**
 * Submit Add Password
 */

Modal.prototype.submitAddPassword = function() {
  var alerts = this.find('.password-alerts');
  var email = this.email();
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (err) {
      log.error('%j', err);
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Error submitting password change request.'
      }).el);
    } else {
      alerts.appendChild(Alert({
        type: 'success',
        text: 'An email has been sent to ' + email +
          ' with instructions to add a password.'
      }).el);
    }
  });
};

/**
 * Submit Email Address
 */

Modal.prototype.submitEmailAddress = function(e) {
  e.preventDefault();
  var alerts = this.find('.email-alerts');
  var email = this.find('input[name=email]').value;
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (err) {
      log.error('%j %s', err, email);
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to add email address.'
      }).el);
    } else {
      alerts.appendChild(Alert({
        type: 'success',
        text: 'An email has been sent to ' + email +
          ' with instructions to add a password and confirm your account.'
      }).el);
    }
  });
};

/**
 * Proxy values
 */

Modal.prototype.anonymous = function() {
  return this.model.commuter._user().anonymous;
};
Modal.prototype.email = function() {
  return this.model.commuter._user().email;
};
Modal.prototype.profileComplete = function() {
  return this.model.commuter._user().email_confirmed;
};

/**
 * Set Walk Speed
 */

Modal.prototype.setWalkSpeed = function(e) {
  this.setSpeed('walkSpeed', 1.4, 1.75, e.target.classList.contains('stroller'));
};

/**
 * Set Bike Speed
 */

Modal.prototype.setBikeSpeed = function(e) {
  this.setSpeed('bikeSpeed', 4.1, 5.125, e.target.classList.contains('cruiser'));
};

/**
 * Set the speed
 */

Modal.prototype.setSpeed = function(name, slow, fast, isSlow) {
  var plan = this.model.plan;
  var scorer = plan.scorer();
  if (isSlow) {
    scorer.rates[name] = slow;
  } else {
    scorer.rates[name] = fast;
  }

  this.selectBikeSpeed();
  this.selectWalkSpeed();
  plan.rescoreOptions();
};

Modal.prototype.selectWalkSpeed = function() {
  this.selectSpeed('walkSpeed', this.find('.stroller'), this.find(
    '.speedwalker'), 1.5);
};

Modal.prototype.selectBikeSpeed = function() {
  this.selectSpeed('bikeSpeed', this.find('.cruiser'), this.find('.racer'), 4.2);
};

/**
 * Select Speed
 */

Modal.prototype.selectSpeed = function(name, slow, fast, speed) {
  var plan = this.model.plan;

  slow.classList.remove('selected');
  fast.classList.remove('selected');

  if (plan.scorer().rates[name] < speed) slow.classList.add('selected');
  else fast.classList.add('selected');
};

/**
 * Journey Modal
 */

Modal.prototype['journeys-view'] = function() {
  return require('./journey');
};

/**
 * Has journeyrs
 */

Modal.prototype.hasJourneys = function() {
  return this.model.journeys.length() > 0;
};
