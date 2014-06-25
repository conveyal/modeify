var config = require('config');
var debug = require('debug')(config.name() + ':welcome-page');
var modal = require('modal');
var spin = require('spinner');
var view = require('view');

/**
 * Create `View`
 */

var View = module.exports = view({
  category: 'planner',
  template: require('./template.html'),
  title: 'Welcome Page'
});

/**
 *
 */

View.prototype.show = function(callback) {
  this.modal = modal(this.el)
    .overlay()
    .show(callback);
};

/**
 * Save
 */

View.prototype.save = function(e) {
  e.preventDefault();
  debug('--> saving');

  var plan = this.model;
  var spinner = spin();
  var modes = [this.mode('bike'), this.mode('bus'), this.mode('train'), this.mode('car'), this.mode('walk')];

  if (!modes.reduce(function(a, b) {
    return a || b;
  })) {
    window.alert('Please select at least one option.');
  } else {
    plan.original_modes(modes);

    debug('<-- saved');
    spinner.remove();

    this.hide();
  }
};

/**
 * Hide
 */

View.prototype.hide = function() {
  if (this.modal) this.modal.hide();
};

/**
 * Get mode
 */

View.prototype.mode = function(name) {
  return this.find('[data-active="' + name + '"]').classList.contains('active');
};
