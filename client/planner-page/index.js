var Batch = require('batch');
var BetaBar = require('beta-bar');
var config = require('config');
var each = require('each');
var FilterView = require('filter-view');
var LocationsView = require('locations-view');
var log = require('log')('planner-page');
var OptionsView = require('options-view');
var PlannerNav = require('planner-nav');
var querystring = require('querystring');
var session = require('session');
var textModal = require('text-modal');
var TransitiveView = require('transitive-view');
var view = require('view');
var showWelcomeWizard = require('welcome-flow');

/**
 * Default from / to addresses
 */

var FROM = config.geocode().start_address;
var TO = config.geocode().end_address;

/**
 * Tool tip position
 */

var toolTipPosition = window.innerWidth < 400 ? 'top' : 'left';

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
  log('render');

  var plan = ctx.plan;
  var views = {
    'beta-bar': new BetaBar(),
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

    // Get the locations from the querystring
    var locations = querystring.parse(window.location.search);

    // If no querystring, see if we have them in the plan already
    var from = locations.from || plan.from() || FROM;
    var to = locations.to || plan.to() || TO;

    // Set addresses and update the routes
    plan.setAddresses(from, to, function(err) {
      if (err) {
        log.error('%e', err);
      } else {
        plan.updateRoutes();
      }
    });

    // Show the welcome page if welcome complete isn't done
    if (!session.commuter().profile().welcome_wizard_complete)
      showWelcomeWizard(session);
  });

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
    to: plan.from(),
    to_id: plan.from_id(),
    to_ll: plan.from_ll()
  });

  plan.updateRoutes();
};

/**
 * Save journey
 */

View.prototype.saveTrip = function(e) {
  e.preventDefault();
  var plan = session.plan();
  plan.saveJourney(function(err) {
    if (err) {
      log.error('%e', err);
      textModal('Failed to save journey.\n' + err);
    } else {
      textModal('Saved journey successfully');
    }
  });
};

/**
 * On submit
 */

View.prototype.onsubmit = function(e) {
  e.preventDefault();
};
