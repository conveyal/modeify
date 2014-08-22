var analytics = require('analytics');
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
  var feedback = this.find('textarea').value + '';
  if (!feedback || feedback.length < 1) {
    window.alert('Please fill in the feedback field above.');
  } else {
    var plan = session.plan().toJSON();

    delete plan.options;
    delete plan.journey;

    analytics.track('Submitted option feedback', {
      feedback: feedback.trim(),
      option: this.model.toJSON(),
      plan: plan
    });

    window.alert('Thanks! We appreciate the feedback!');
    this.hide();
  }
};
