var analytics = require('analytics');
var config = require('config');
var debug = require('debug')(config.application() + ':feedback-modal');
var modal = require('modal');
var session = require('session');
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
 * Hide
 */

View.prototype.hide = function(e) {
  if (e) e.preventDefault();
  if (this.modal) this.modal.hide();
};

/**
 * Submit
 */

View.prototype.submit = function(e) {
  e.preventDefault();
  var feedback = this.find('textarea').value + '';
  if (!feedback || feedback.length < 1) {
    window.alert('Please fill in the feedback field above.');
  } else {
    var plan = session.plan().toJSON();

    delete plan.options;
    delete plan.journey;

    analytics.track('Submitted feedback', {
      feedback: feedback.trim(),
      plan: plan,
      route: this.model.toJSON()
    });

    window.alert('Thanks! We appreciate the feedback!');
    this.hide();
  }
};