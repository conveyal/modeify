var config = require('config');
var debug = require('debug')(config.name() + ':welcome-page');
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
  debug('--> saving');

  var plan = this.model;
  var modes = [this.mode('bike'), this.mode('bus'), this.mode('train'), this.mode(
    'car'), this.mode('walk')];

  if (!modes.reduce(function(a, b) {
    return a || b;
  })) {
    window.alert('Please select at least one option.');
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

    debug('<-- saved');
  }
};

/**
 * Get mode
 */

Modal.prototype.mode = function(name) {
  return this.find('[data-active="' + name + '"]').classList.contains('active');
};
