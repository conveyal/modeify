var Batch = require('batch');
var config = require('config');
var each = require('each');
var FilterView = require('filter-view');
var LocationsView = require('locations-view');
var log = require('log')('planner-page');
var OptionsView = require('options-view');
var Overlay = require('overlay');
var PlannerNav = require('planner-nav');
var querystring = require('querystring');
var session = require('session');
var textModal = require('text-modal');
var Tip = require('tip');
var TransitiveView = require('transitive-view');
var view = require('view');
var WelcomePage = require('welcome-page');

/**
 * Default from / to addresses
 */

var FROM = config.geocode.start_address;
var TO = config.geocode.end_address;

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

    // Show the welcome page if welcome complete isn't done
    if (!plan.welcome_complete()) {
      plan.setAddresses(locations.from || FROM, locations.to || TO, function(
        err) {
        if (err) {
          log.error('%e', err);
        } else {
          plan.updateRoutes({
            modes: 'BICYCLE,WALK,TRAINISH,BUS,CAR'
          });
        }
      });

      ctx.view.showWelcomeWizard();
    } else if (locations.to && locations.from) {
      log('load in locations from query parameters');

      plan.setAddresses(locations.from, locations.to, function(err) {
        if (err) {
          log.error('%e', err);
        } else {
          plan.updateRoutes();
        }
      });
    } else {
      plan.updateRoutes();
    }
  });

  next();
};

/**
 * Show Welcome Wizard
 */

View.prototype.showWelcomeWizard = function() {
  log('welcome incomplete, show welcome wizard');

  // Tool Tips
  var fromTip = new Tip(require('./from-tip.html'));
  var toTip = new Tip(require('./to-tip.html'));
  var timeTip = new Tip(require('./time-tip.html'));

  fromTip.position(toolTipPosition);
  toTip.position(toolTipPosition);
  timeTip.position(toolTipPosition);

  var plan = session.plan();
  var welcome = new WelcomePage(plan);
  welcome.show();
  welcome.modal.on('hide', showFrom);

  function showFrom() {
    fromTip.show('.input-group.from');

    var fromLocation = document.getElementById('from-location');
    fromLocation.focus();
    fromLocation.select();

    document.querySelector('.from-next-button').onclick = function() {
      fromTip.hide();
    };

    fromLocation.onblur = function() {
      fromTip.hide();
    };

    fromTip.on('hide', showTo);
  }

  function showTo() {
    toTip.show('.input-group.to');

    var toLocation = document.getElementById('to-location');
    toLocation.focus();
    toLocation.select();

    toLocation.onblur = function() {
      toTip.hide();
    };

    document.querySelector('.to-next-button').onclick = function() {
      toTip.hide();
    };

    toTip.on('hide', showTime);
  }

  function showTime() {
    timeTip.show('.time-filters');

    document.querySelector('.time-next-button').onclick = function() {
      timeTip.hide();
      plan.welcome_complete(true);
    };
  }
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
