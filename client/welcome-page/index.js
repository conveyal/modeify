var Alert = require('alert');
var log = require('log')('welcome-page');
var modal = require('modal');

/**
 * Create `Modal`
 */

var Modal = module.exports = modal({
  category: 'planner',
  template: require('./template.html'),
  title: 'Welcome Page'
});

/**
 * Save
 */

Modal.prototype.save = function(e) {
  e.preventDefault();
  log.info('--> saving');

  var alerts = this.find('.alerts');
  var plan = this.model;
  var modes = [this.mode('bike'), this.mode('bus'), this.mode('train'), this.mode(
    'car'), this.mode('walk')];

  if (!modes.reduce(function(a, b) {
    return a || b;
  })) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please select at least one option.'
    }).el);
  } else {
    this.hide();

    plan.set({
      bike: true,
      bus: true,
      car: true,
      train: true,
      walk: true,
      original_modes: modes
    });

    log.info('<-- saved');
  }
};

/**
 * Get mode
 */

Modal.prototype.mode = function(name) {
  return this.find('[data-active="' + name + '"]').classList.contains('active');
};
