/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':welcome-page');
var geocode = require('geocode');
var page = require('page');
var spin = require('spinner');
var view = require('view');

/**
 * Create `View`
 */

var View = view(require('./template.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  var plan = ctx.plan;

  // check if plan is full enough to redirect to planner
  if (plan.original_modes() !== null && plan.from_ll() !== null && plan.to_ll() !==
    null) {
    ctx.redirect = '/planner';
  } else {
    ctx.view = new View(plan);
  }

  next();
};

/**
 * Set Mode
 */

View.prototype.setMode = function(e) {
  var el = e.target;
  var mode = el.dataset.active;

  if (!mode) {
    el = el.parentNode;
    mode = el.dataset.active;
  }

  this.model[mode](!el.classList.contains('active'));
  document.activeElement.blur();
};

/**
 * Save
 */

View.prototype.save = function() {
  var plan = this.model;
  var spinner = spin();
  var fromEl = this.find('[name="from"]');
  var toEl = this.find('[name="to"]');

  if (!plan.original_modes()) {
    var modes = [this.mode('bike'), this.mode('bus'), this.mode('train'), this.mode(
      'car'), this.mode('walk')];
    if (!modes.reduce(function(a, b) {
      return a || b;
    })) {
      window.alert('Please select at least one option.');
    } else {
      plan.original_modes(modes);
    }
    spinner.remove();
  } else if (!plan.from_ll()) {
    this.geocode(fromEl, function(err, ll) {
      if (err) {
        window.alert('Please enter a valid address.');
      } else {
        plan.from(fromEl.value);
        plan.from_ll(ll);
      }
      spinner.remove();
    });
  } else {
    this.geocode(toEl, function(err, ll) {
      if (err) {
        window.alert('Please enter a valid address.');
      } else {
        plan.to(toEl.value);
        plan.to_ll(ll);
        page('/planner');
      }
      spinner.remove();
    });
  }
};

/**
 * Geocode && Save
 */

View.prototype.geocode = function(el, fn) {
  geocode(el.value, fn);
};

/**
 * Back
 */

View.prototype.back = function() {
  if (this.model.from_ll()) {
    this.model.from_ll(null);
  } else {
    this.model.original_modes(null);
  }
};

/**
 * Get mode
 */

View.prototype.mode = function(name) {
  return this.find('[data-active="' + name + '"]').classList.contains('active');
};
