var config = require('config');
var debug = require('debug')(config.name() + ':welcome-page');
var Location = require('location');
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

View.prototype.save = function(e) {
  e.preventDefault();
  debug('--> saving');

  var plan = this.model;
  var spinner = spin();
  var fromEl = this.find('[name="from"]');
  var toEl = this.find('[name="to"]');
  var done = function() {
    debug('<-- saved');
    spinner.remove();
  };

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
    done();
  } else if (!plan.from_valid()) {
    this.saveFrom(fromEl.value, function(err) {
      if (err) window.alert('Please enter a valid address.');
      done();
    });
  } else {
    this.saveTo(toEl.value, function(err) {
      if (err) window.alert('Please enter a valid address.');
      done();
    });
  }
};

/**
 * Save From
 */

View.prototype.saveFrom = function(address, callback) {
  var plan = this.model;
  var location = new Location({
    address: address,
    category: 'residence',
    name: 'Home'
  });

  location.save(function(err, res) {
    if (err) {
      callback(err);
    } else {
      var ll = res.body.coordinate;

      plan.set({
        from: address,
        from_id: res.body._id,
        from_ll: ll,
        from_valid: true
      });

      if (plan.welcome_complete()) page('/planner');
      callback();
    }
  });
};

/**
 * Save to
 */

View.prototype.saveTo = function(address, callback) {
  var plan = this.model;
  var location = new Location({
    address: address,
    category: 'office',
    name: 'Work'
  });

  location.save(function(err, res) {
    if (err) {
      callback(err);
    } else {
      var ll = res.body.coordinate;

      plan.set({
        to: address,
        to_id: res.body._id,
        to_ll: ll,
        to_valid: true
      });

      page('/planner');
      callback();
    }
  });
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
