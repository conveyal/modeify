var config = require('config');
var debug = require('debug')(config.application() + ':commuter-profile');
var modal = require('modal');
var request = require('request');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  var plan = model.plan;
  var stroller = view.find('.stroller');
  var speedwalker = view.find('.speedwalker');
  var cruiser = view.find('.cruiser');
  var racer = view.find('.racer');

  selectWalkSpeed();
  selectBikeSpeed();

  plan.on('change walk_speed', selectWalkSpeed);
  plan.on('change bike_speed', selectBikeSpeed);

  function selectWalkSpeed() {
    stroller.classList.remove('selected');
    speedwalker.classList.remove('selected');

    if (plan.walk_speed() === 1.4) stroller.classList.add('selected');
    else speedwalker.classList.add('selected');
  }

  function selectBikeSpeed() {
    cruiser.classList.remove('selected');
    racer.classList.remove('selected');

    if (plan.bike_speed() === 4.1) cruiser.classList.add('selected');
    else racer.classList.add('selected');
  }
});

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
 * Set Walk Speed
 */

View.prototype.setWalkSpeed = function(e) {
  console.log('setting walk speed', e);
  if (e.target.classList.contains('stroller')) {
    this.model.plan.walk_speed(1.4);
  } else {
    this.model.plan.walk_speed(1.75);
  }
};

/**
 * Set Bike Speed
 */

View.prototype.setBikeSpeed = function(e) {
  console.log('setting bike speed', e);
  if (e.target.classList.contains('cruiser')) {
    this.model.plan.bike_speed(4.1);
  } else {
    this.model.plan.bike_speed(5.125);
  }
};

/**
 * Journey View
 */

View.prototype['journeys-view'] = function() {
  return require('./journey');
};
