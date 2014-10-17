var Alert = require('alert');
var log = require('log')('welcome-page');
var modal = require('modal');

/**
 * Modes
 */

var MODES = ['bike', 'bus', 'train', 'car', 'walk'];

/**
 * Create `Modal`
 */

var Welcome = modal({
  category: 'planner',
  template: require('./template.html'),
  title: 'Welcome Page'
});

/**
 * Show Modal
 */

module.exports = function(plan) {
  var welcome = new Welcome(plan);
  welcome.show();
};

/**
 * Save
 */

Welcome.prototype.save = function(e) {
  e.preventDefault();
  log('--> saving');

  var alerts = this.find('.alerts');
  var self = this;
  var modes = MODES.map(function(m) {
    return self.mode(m);
  });

  if (!modes.reduce(function(a, b) {
      return a || b;
    })) {
    alerts.innerHTML = '';
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please select at least one option.'
    }).el);
  } else {
    this.hide();
    this.model.original_modes(modes);

    log('<-- saved');
  }
};

/**
 * Get mode
 */

Welcome.prototype.mode = function(name) {
  return this.find('[data-active="' + name + '"]').classList.contains('active');
};

/**
 * Highjack the mode functions
 */

MODES.map(function(m) {
  Welcome.prototype[m] = function(v) {
    this.toggle(m, v);
  };
});

/**
 * Toggle
 */

Welcome.prototype.toggle = function(type, val) {
  if (val === undefined) return false;
  var el = this.find('[data-active="' + type + '"]');
  if (val) el.classList.add('active');
  else el.classList.remove('active');
};
