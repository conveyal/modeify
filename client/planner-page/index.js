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
var scrollbarSize = require('scrollbar-size');
var scrolling = require('scrolling');
var session = require('session');
var textModal = require('text-modal');
var TransitiveView = require('transitive-view');
var UAParser = require('ua-parser-js');
var view = require('view');
var showWelcomeWizard = require('welcome-flow');

/**
 * Default from / to addresses
 */

var FROM = config.geocode().start_address;
var TO = config.geocode().end_address;

/**
 * Parse the User Agent
 */

var ua = new UAParser().getResult();

/**
 * Create `View`
 */

var View = view({
  category: 'planner',
  template: require('./template.html'),
  title: 'Planner Page'
}, function(view, model) {
  view.scrollable = view.find('.scrollable');
  view.moreOptions = view.find('.more-options');

  if (scrollbarSize > 0) {
    view.scrollable.style.marginRight = -scrollbarSize + 'px';

    if (ua.browser.name !== 'IE' && ua.os.name !== 'Linux')
      view.scrollable.style.paddingRight = scrollbarSize + 'px';
  }

  scrolling(view.scrollable, function(e) {
    view.scrolled(e);
  });

  model.plan.on('updating options complete', function() {
    view.scrolled();
  });
});

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  log('render');

  var plan = ctx.plan;

  // Set plan to loading
  plan.loading(true);

  // Set up the views
  var views = {
    'beta-bar': new BetaBar(),
    'filter-view': new FilterView(plan),
    'locations-view': new LocationsView(plan),
    'options-view': new OptionsView(plan),
    'planner-nav': new PlannerNav(session),
    plan: plan,
    'transitive-view': new TransitiveView(plan)
  };

  ctx.view = new View(views);
  ctx.view.on('rendered', function() {
    each(views, function(key, view) {
      view.emit('rendered', view);
    });

    // Get the locations from the querystring
    var query = querystring.parse(window.location.search);

    // Clear plan & cookies for now, plan will re-save automatically on save
    plan.clearStore();

    // If it's a shared URL or welcome is complete skip the welcome screen
    if ((query.from && query.to) || session.commuter().profile().welcome_wizard_complete) {
      // If no querystring, see if we have them in the plan already
      var from = query.from || plan.from() || FROM;
      var to = query.to || plan.to() || TO;

      // Same addresses?
      var sameAddresses = from === plan.from() && to === plan.to();

      // Set plan from querystring
      if (query.modes) plan.setModes(query.modes);
      if (query.start_time !== undefined) plan.start_time(parseInt(query.start_time, 10));
      if (query.end_time !== undefined) plan.end_time(parseInt(query.end_time, 10));
      if (query.days !== undefined) plan.days(query.days);

      // If has valid coordinates, load
      if (plan.validCoordinates() && sameAddresses) {
        plan.journey({
          places: plan.generatePlaces()
        });
        plan.updateRoutes();
      } else {
        // Set addresses and update the routes
        plan.setAddresses(from, to, function(err) {
          if (err) {
            log.error('%e', err);
          } else {
            plan.journey({
              places: plan.generatePlaces()
            });
            plan.updateRoutes();
          }
        });
      }
    } else {
      showWelcomeWizard(session);
    }
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
 * Scroll
 */

View.prototype.scroll = function(e) {
  e.preventDefault();
  this.scrollable.scrollTop += (this.scrollable.scrollHeight / 5);
};

/**
 * Scrolled
 */

View.prototype.scrolled = function(e) {
  var lastOption = document.querySelector('.option:last-of-type');
  if (lastOption && this.scrollable.scrollTop < (lastOption.offsetTop - this.scrollable.clientHeight)) {
    this.moreOptions.classList.remove('hidden');
  } else {
    this.moreOptions.classList.add('hidden');
  }
};

/**
 * On submit
 */

View.prototype.onsubmit = function(e) {
  e.preventDefault();
};
