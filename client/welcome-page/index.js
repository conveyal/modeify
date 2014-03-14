/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':welcome-page');
var geocode = require('geocode');
var page = require('page');
var session = require('session');
var spin = require('spinner');
var view = require('view');

/**
 * Create `View`
 */

var View = view({
  category: 'planner',
  template: require('./template.html'),
  title: 'Welcome Page'
});

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  var plan = ctx.plan;

  // check if plan is full enough to redirect to planner
  if (plan.welcome_complete()) {
    ctx.redirect = '/planner';
  } else {
    debug('showing welcome page view with plan');
    ctx.view = new View(plan);
  }

  next();
};

/**
 * Save
 */

View.prototype.save = function() {
  debug('--> saving');
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
      if (plan.welcome_complete()) page('/planner');
    }

    debug('<-- saved');
    spinner.remove();
  } else if (!plan.fromIsValid()) {
    this.geocode(fromEl, function(err, ll) {
      if (err) {
        window.alert('Please enter a valid address.');
      } else {
        plan.set({
          from: fromEl.value,
          from_ll: ll
        });
        if (plan.welcome_complete()) page('/planner');
      }
      spinner.remove();
      debug('<-- saved');
    });
  } else {
    this.geocode(toEl, function(err, ll) {
      if (err) {
        window.alert('Please enter a valid address.');
      } else {
        plan.set({
          to: toEl.value,
          to_ll: ll
        });
        page('/planner');
      }
      spinner.remove();
      debug('<-- saved');
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
