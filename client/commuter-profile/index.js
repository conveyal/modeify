var log = require('./client/log')('commuter-profile');
var modal = require('./client/modal');
var page = require('page');
var session = require('session');
var SignUpForm = require('sign-up-form');

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
 * Sign Up Form
 */

Modal.prototype.signUpForm = function() {
  return new SignUpForm();
};

/**
 * Log out
 */

Modal.prototype.logout = function(e) {
  if (e) e.preventDefault();
  this.hide();
  session.logout(function(err) {
    page('/');
  });
};

/**
 * Proxy values
 */

Modal.prototype.anonymous = function() {
  return this.model.commuter.anonymous();
};
Modal.prototype.email = function() {
  return this.model.commuter._user().email;
};
Modal.prototype.emailConfirmed = function() {
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
  return this.model.journeys && this.model.journeys.length() > 0;
};
