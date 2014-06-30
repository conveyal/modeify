var config = require('config');
var Batch = require('batch');
var debug = require('debug')(config.application() + ':planner-page');
var each = require('each');
var FilterView = require('filter-view');
var LocationsView = require('locations-view');
var OptionsView = require('options-view');
var Overlay = require('overlay');
var PlannerNav = require('planner-nav');
var Tip = require('tip');
var session = require('session');
var TransitiveView = require('transitive-view');
var view = require('view');
var WelcomePage = require('welcome-page');

/**
 * Default from / to addresses
 */

var FROM = '4301 13th St NW Washington, DC 20011';
var TO = '2100 Wilson Blvd, Arlington, VA';

/**
 * Create `View`
 */

var View = view({
  category: 'planner',
  template: require('./template.html'),
  title: 'Planner Page'
});

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  var plan = ctx.plan;
  var views = {
    'filter-view': new FilterView(plan),
    'locations-view': new LocationsView(plan),
    'options-view': new OptionsView(plan),
    'planner-nav': new PlannerNav(session),
    'transitive-view': new TransitiveView(plan)
  };

  ctx.view = new View(views);
  ctx.view.on('rendered', function() {
    each(views, function(key, view) {
      view.emit('rendered', view);
    });

    if (!plan.routes() || !plan.patterns() && plan.welcome_complete()) plan.updateRoutes();
  });

  ctx.view.reactive.bind('autosubmit', function(el) {
    el.onsubmit = function(e) {
      e.preventDefault();
      plan.updateRoutes();
    };
  });

  // Show the welcome page if welcome complete isn't done
  if (!plan.welcome_complete()) {
    // Initialize the default locations
    var batch = new Batch();
    batch.push(function(done) {
      plan.setAddress('from', FROM, done);
    });
    batch.push(function(done) {
      plan.setAddress('to', TO, done);
    });
    batch.end(function(err) {
      if (!err) plan.updateRoutes({
        modes: 'BICYCLE,WALK,TRAINISH,BUS,CAR'
      });
    });

    var welcome = new WelcomePage(plan);
    welcome.show();
    welcome.modal.on('hide', function() {
      var from = new Tip(require('./from-tip.html'));
      from.position('left');
      from.show('#from-location');

      var fromLocation = document.getElementById('from-location');
      fromLocation.focus();
      fromLocation.select();

      document.querySelector('.from-next-button').onclick = function() {
        from.hide();
      };

      from.on('hide', function() {
        var to = new Tip(require('./to-tip.html'));
        to.position('left');
        to.show('#to-location');

        var toLocation = document.getElementById('to-location');
        toLocation.focus();
        toLocation.select();

        document.querySelector('.to-next-button').onclick = function() {
          to.hide();
          plan.welcome_complete(true);
          plan.updateRoutes();
        };
      });
    });
  }

  next();
};

/**
 * Reverse Commute
 */

View.prototype.reverseCommute = function(e) {
  e.preventDefault();
  var plan = session.plan();
  plan.set({
    from: plan.to(),
    from_id: plan.to_id(),
    from_ll: plan.to_ll(),
    reverse_commute: !plan.reverse_commute(),
    to: plan.from(),
    to_id: plan.from_id(),
    to_ll: plan.from_ll()
  });
};

/**
 * Save journey
 */

View.prototype.saveTrip = function(e) {
  var plan = session.plan();
  plan.saveJourney(function(err) {
    if (err) {
      debug(err);
      window.alert('Failed to save journey.\n' + err);
    } else {
      window.alert('Saved journey successfully');
    }
  });
};

/**
 * On submit
 */

View.prototype.onsubmit = function(e) {
  e.preventDefault();
};
