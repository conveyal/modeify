var Alert = require('alert');
var analytics = require('analytics');
var log = require('./client/log')('feedback-modal');
var modal = require('./client/modal');
var request = require('./client/request');
var session = require('session');
var config = require('config');
var superagent = require('superagent');

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
  var input = this.find('input');
  var feedback = textarea.value + '';
  var email = input.value + '';
  var results = this.model.toJSON ? this.model.toJSON() : {};
  var self = this;
  var changeset = {
    parent: null,
    entity: config.feedback_table_name(), 
    type: 'DML',
    action: 'INSERT'
  };

  button.disabled = true;
  if (!feedback || feedback.length < 1) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please fill in the feedback field below.'
    }).el);
  } else {
    var data = {
      feedback: feedback,
      plan: JSON.stringify(session.plan().generateQuery()),
      results: JSON.stringify(results),
      timestamp: (new Date()).toISOString(), 
      email: email,
      url: location.href
    };
    var url = config.feedback_write_url() + 
      '?token=' + config.feedback_write_token();
    if (location.host.indexOf(config.ignore_events_from()) !== -1) {
      alerts.appendChild(Alert({
        type: 'success',
        text: 'Thanks! We appreciate the feedback!'
      }).el);

      setTimeout(function() {
        self.hide();
      }, 2500);
      return;
    } 

    changeset.data = [{amigo_id: null, new: data}];

    $.post(
      url,
      $.param({change: JSON.stringify(changeset)}),
      function (e) {
        analytics.track('Submitted Feedback', data);

        alerts.appendChild(Alert({
          type: 'success',
          text: 'Thanks! We appreciate the feedback!'
        }).el);

        setTimeout(function() {
          self.hide();
        }, 2500);
      }
    );
  }
};
