/**
 * Dependencies
 */

var analytics = require('analytics');
var config = require('config');
var debug = require('debug')(config.name() + ':plan');
var geocode = require('geocode');
var defaults = require('model-defaults');
var model = require('model');
var otp = require('otp');
var session = require('session');
var store = require('store');

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    from: '',
    to: '',
    original_modes: null,
    from_ll: null,
    to_ll: null,
    start_time: 7,
    end_time: 9,
    am_pm: 'am',
    bike: false,
    bus: false,
    train: false,
    car: false,
    walk: false,
    days: 'M—F',
    routes: [],
    patterns: null,
    commuter: null,
    welcome_complete: false
  }))
  .attr('original_modes')
  .attr('start_time')
  .attr('end_time')
  .attr('am_pm')
  .attr('bike')
  .attr('bus')
  .attr('train')
  .attr('car')
  .attr('walk')
  .attr('from')
  .attr('to')
  .attr('from_ll')
  .attr('to_ll')
  .attr('days')
  .attr('routes')
  .attr('patterns')
  .attr('welcome_complete');

/**
 * Filters
 */

var filters = ['am_pm', 'bike', 'bus', 'train', 'car', 'walk', 'days', 'start_time', 'end_time', 'from_ll', 'to_ll' ];

/**
 * Sync plans with localStorage
 */

Plan.on('change', function(plan, name, val) {
  debug('plan.%s changed', name);

  // if the type is a filter, trigger `updateRoutes`
  if (plan.welcome_complete()) {
    if (filters.indexOf(name) !== -1) {
      plan.updateRoutes();
    }
  } else if (plan.original_modes() && plan.from_ll() && plan.to_ll()) {
    plan.welcome_complete(true);
  }

  // Store in localStorage
  plan.store();

  // track the change
  analytics.track('plan.' + name + ' change', val);
});

/**
 * Load plan middleware
 */

Plan.load = function(ctx, next) {
  debug('loading plan at %s', ctx.path);

  // check if we have a stored plan
  var opts = store('plan');
  if (session.isLoggedIn() && session.commuter()) {
    var commuter = session.commuter();
    debug('loading plan for logged in commuter %s', commuter._id());

    // if the stored plan is not the logged in commuters, change
    if (opts.commuter !== commuter._id()) {
      debug('load plan from the commuter instead of localStorage');

      opts = commuter.opts();
      var org = commuter._organization();

      opts.from = commuter.fullAddress();
      opts.from_ll = commuter.coordinate();

      // if there is an organization attached to this commuter
      if (org && org.model) {
        opts.to = org.fullAddress();
        opts.to_ll = org.coordinate();
      }
    }
  }

  ctx.plan = new Plan(opts);
  session.plan(ctx.plan);

  next();
};

/**
 * Update routes
 */

Plan.prototype.updateRoutes = function() {
  debug('--> updating routes');

  var plan = this;
  var from = plan.from_ll();
  var to = plan.to_ll();
  var startTime = plan.start_time();
  var endTime = plan.end_time();
  var date = nextDate(plan.days());

  if (plan.am_pm() === 'pm') {
    startTime += 12;
    endTime += 12;
  }

  if (endTime === 24) endTime = '23:59';
  else endTime += ':00';

  if (from && to && from.lat && from.lng && to.lat && to.lng) {
    debug('updating routes from %s to %s on %s between %s and %s %s', from, to,
      date, startTime, endTime, plan.am_pm());
    otp.profile({
      from: [from.lat, from.lng],
      to: [to.lat, to.lng],
      startTime: startTime + ':00',
      endTime: endTime + ':00',
      date: date
    }, function(err, data) {
      if (err) {
        plan.emit('error', err);
      } else {
        debug('<-- updated routes');
        plan.routes(data.options);

        // get the patterns
        otp.patterns({
          options: data.options.slice(0, 3)
        }, function(patterns) {
          plan.patterns(patterns);
        });
      }
    });
  } else {
    debug('<-- updating routes not completed: from/to ll does not exist');
  }
};

/**
 * Geocode
 */

Plan.prototype.geocode = function(dest, callback) {
  if (!callback) callback = function() {};

  var plan = this;
  var address = plan[dest]();
  var ll = plan[dest + '_ll']();
  if (address && address.length > 0) {
    geocode(address, function(err, ll) {
      if (err) {
        callback(err);
      } else {
        plan[dest + '_ll'](ll);
        callback(null, ll);
      }
    });
  } else {
    callback(null, ll);
  }
};

/**
 * Store in localStorage
 */

Plan.prototype.store = function() {
   // convert to "JSON", remove routes & patterns
  var json = this.toJSON();
  delete json.routes;
  delete json.patterns;

  // save in local storage
  store('plan', json);

  // if we've created a commuter object, save to the commuter
  var commuter = session.commuter();
  if (commuter) {
    commuter.opts(json);
    commuter.save();
  }
};

/**
 * Clear localStorage
 */

Plan.prototype.clearStore = function() {
  store('plan', null);
};

/**
 * Get next date for day of the week
 */

function nextDate(dayType) {
  var now = new Date();
  var date = now.getDate();
  var dayOfTheWeek = now.getDay();
  switch (dayType) {
    case 'M—F':
      if (dayOfTheWeek === 0) now.setDate(date + 1);
      if (dayOfTheWeek === 6) now.setDate(date + 2);
      break;
    case 'Sat':
      now.setDate(date + (6 - dayOfTheWeek));
      break;
    case 'Sun':
      now.setDate(date + (7 - dayOfTheWeek));
      break;
  }
  return now.toISOString().split('T')[0];
}
