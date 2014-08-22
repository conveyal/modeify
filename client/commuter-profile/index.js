var config = require('config');
var debug = require('debug')(config.application() + ':commuter-profile');
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

Modal.prototype.submitEmailAddress = function(e) {
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
  var plan = this.model.plan;
  var scorer = plan.scorer();
  if (e.target.classList.contains('stroller')) {
    scorer.rates.walkSpeed = 1.4;
  } else {
    scorer.rates.walkSpeed = 1.75;
  }

  this.selectWalkSpeed();
  plan.rescoreOptions();
};

/**
 * Set Bike Speed
 */

Modal.prototype.setBikeSpeed = function(e) {
  var plan = this.model.plan;
  var scorer = plan.scorer();
  if (e.target.classList.contains('cruiser')) {
    scorer.rates.bikeSpeed = 4.1;
  } else {
    scorer.rates.bikeSpeed = 5.125;
  }

  this.selectBikeSpeed();
  plan.rescoreOptions();
};

Modal.prototype.selectWalkSpeed = function() {
  var plan = this.model.plan;
  var stroller = this.find('.stroller');
  var speedwalker = this.find('.speedwalker');

  stroller.classList.remove('selected');
  speedwalker.classList.remove('selected');

  if (plan.scorer().rates.walkSpeed < 1.5) stroller.classList.add('selected');
  else speedwalker.classList.add('selected');
};

Modal.prototype.selectBikeSpeed = function() {
  var plan = this.model.plan;
  var cruiser = this.find('.cruiser');
  var racer = this.find('.racer');

  cruiser.classList.remove('selected');
  racer.classList.remove('selected');

  if (plan.scorer().rates.bikeSpeed < 4.2) cruiser.classList.add('selected');
  else racer.classList.add('selected');
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
