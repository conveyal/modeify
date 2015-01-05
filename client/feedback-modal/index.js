var Alert = require('alert');
var log = require('log')('feedback-modal');
var modal = require('modal');
var request = require('request');
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
  var plan = session.plan().toJSON();
  var results = this.model.toJSON();
  var self = this;

  if (!feedback || feedback.length < 1) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please fill in the feedback field below.'
    }).el);
  } else {
    button.remove();

    delete plan.options;
    delete plan.journey;

    request.post('/feedback', {
      feedback: feedback.trim(),
      plan: plan,
      results: results
    }, function(err) {
      if (err) {
        log.error('%e', err);
        alerts.appendChild(Alert({
          type: 'danger',
          text: 'Failed to submit feedback.'
        }).el);
      } else {
        window.analytics.track('Submitted Option Feedback');

        alerts.appendChild(Alert({
          type: 'success',
          text: 'Thanks! We appreciate the feedback!'
        }).el);

        setTimeout(function() {
          self.hide();
        }, 2500);
      }
    });
  }
};
