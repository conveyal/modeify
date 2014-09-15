var analytics = require('analytics');
var Alert = require('alert');
var config = require('config');
var debug = require('debug')(config.application() + ':feedback-modal');
var modal = require('modal');
var session = require('session');

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  template: require('./template.html')
});

/**
 * Submit
 */

Modal.prototype.submit = function(e) {
  e.preventDefault();
  var alerts = this.find('.alerts');
  var button = this.find('button');
  var feedback = this.find('textarea').value + '';

  if (!feedback || feedback.length < 1) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please fill in the feedback field below.'
    }).el);
  } else {
    button.remove();

    var plan = session.plan().toJSON();

    delete plan.options;
    delete plan.journey;

    analytics.track('Submitted feedback about an option', {
      feedback: feedback.trim(),
      option: this.model.toJSON(),
      plan: plan
    });

    alerts.appendChild(Alert({
      type: 'success',
      text: 'Thanks! We appreciate the feedback!'
    }).el);

    var self = this;
    setTimeout(function() {
      self.hide();
    }, 2500);
  }
};
