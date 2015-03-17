var Alert = require('alert');
var analytics = require('analytics');
var log = require('./client/log')('feedback-modal');
var modal = require('./client/modal');
var request = require('./client/request');
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
  var textarea = this.find('textarea');
  var feedback = textarea.value + '';
  var results = this.model.toJSON ? this.model.toJSON() : {};
  var self = this;

  button.disabled = true;
  if (!feedback || feedback.length < 1) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please fill in the feedback field below.'
    }).el);
  } else {
    var data = {
      feedback: feedback,
      plan: session.plan().generateQuery(),
      results: results
    };

    request.post('/feedback', data, function(err) {
      if (err) {
        log.error('%e', err);
        alerts.appendChild(Alert({
          type: 'danger',
          text: 'Failed to submit feedback.'
        }).el);
        button.disabled = false;
      } else {
        analytics.track('Submitted Feedback', data);

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
