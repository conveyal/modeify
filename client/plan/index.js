var analytics = require('analytics');
var config = require('config');
var debounce = require('debounce');
var debug = require('debug')(config.name() + ':plan');
var geocode = require('geocode');
var Journey = require('journey');
var defaults = require('model-defaults');
var model = require('model');
var otp = require('otp');
var session = require('session');
var store = require('store');

var DEFAULT_ROUTES = require('./routes');

/**
 * Max routes & patterns to show
 */

var MAX_ROUTES = localStorage.getItem('max_routes') || 3;
var MAX_PATTERNS = localStorage.getItem('max_patterns') || MAX_ROUTES;

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    bike: false,
    bus: false,
    car: false,
    days: 'M—F',
    end_time: 9,
    from: '',
    from_valid: false,
    routes: [],
    start_time: 7,
    to: '',
    to_valid: false,
    train: false,
    walk: false,
    welcome_complete: false
  }))
  .attr('bike')
  .attr('bus')
  .attr('car')
  .attr('days')
  .attr('end_time')
  .attr('from')
  .attr('from_id')
  .attr('from_ll')
  .attr('from_valid')
  .attr('original_modes')
  .attr('patterns')
  .attr('reverse_commute')
  .attr('routes')
  .attr('start_time')
  .attr('to')
  .attr('to_id')
  .attr('to_ll')
  .attr('to_valid')
  .attr('train')
  .attr('walk')
  .attr('welcome_complete');

/**
 * Filters
 */

var filters = ['bike', 'bus', 'train', 'car', 'walk', 'days',
  'start_time', 'end_time', 'from_ll', 'to_ll'
];

/**
 * Sync plans with localStorage
 */

Plan.on('change', function(plan, name, val) {
  debug('plan.%s changed to %s', name, val);

  // if the type is a filter, trigger `updateRoutes`
  if (plan.welcome_complete()) {
    if (filters.indexOf(name) !== -1) {
      plan.updateRoutes();
    }
  } else if (plan.original_modes() && plan.from_valid() && plan.to_valid()) {
    plan.attrs.bike = true;
    plan.attrs.bus = true;
    plan.attrs.car = false;
    plan.attrs.train = true;
    plan.attrs.walk = true;
    plan.welcome_complete(true);
  }

  // Store in localStorage
  if (name !== 'routes' && name !== 'patterns') plan.store(name, val);
});

/**
 * Keep start/end times in sync
 */

Plan.on('change start_time', function(plan, val, prev) {
  if (val >= plan.end_time()) plan.end_time(val + 1);
});

Plan.on('change end_time', function(plan, val, prev) {
  if (val <= plan.start_time()) plan.start_time(val - 1);
});

/**
 * Load plan middleware
 */

Plan.load = function(ctx, next) {
  var plan = session.plan();
  if (!plan) {
    debug('loading plan at %s', ctx.path);

    // check if we have a stored plan
    var opts = store('plan') || {};
    if (session.isLoggedIn() && session.commuter()) {
      var commuter = session.commuter();
      debug('loading plan for logged in commuter %s', commuter._id());

      // if the stored plan is not the logged in commuters, change
      if (opts._commuter !== commuter._id()) {
        debug('load plan from the commuter instead of localStorage');

        opts = commuter.opts();
        var org = commuter._organization();

        opts.from = commuter.fullAddress() || opts.from;
        opts.from_ll = commuter.coordinate() || opts.from_ll;

        // if there is an organization attached to this commuter
        if (org && org.model) {
          opts.to = org.fullAddress();
          opts.to_ll = org.coordinate();
        }
      }
    }

    // remove stored patterns & routes
    delete opts.patterns;
    delete opts.routes;

    plan = new Plan(opts);
    session.plan(plan);
  }

  ctx.plan = plan;
  next();
};

/**
 * Update routes. Restrict to once every 100ms.
 */

Plan.prototype.updateRoutes = debounce(function(callback) {
  callback = callback || function() {};
  debug('--> updating routes');

  var plan = this;
  var from = plan.from_ll();
  var to = plan.to_ll();
  var startTime = plan.start_time();
  var endTime = plan.end_time();
  var date = nextDate(plan.days());

  // Do a minimum 2 hour window
  if (startTime === 0) startTime += ':00';
  else startTime = (startTime - 1) + ':30';

  if (endTime === 24) endTime = '23:59';
  else endTime += ':30';

  // Pattern options
  var options = {
    from: {
      lat: from.lat,
      lon: from.lng,
      name: 'Home'
    },
    to: {
      lat: to.lat,
      lon: to.lng,
      name: 'Work'
    },
    routes: DEFAULT_ROUTES
  };

  if (plan.validCoordinates()) {
    debug('--- updating routes from %s to %s on %s between %s and %s',
      from, to, date, startTime, endTime);
    otp.profile({
      from: options.from,
      to: options.to,
      startTime: startTime,
      endTime: endTime,
      date: date,
      orderBy: 'AVG',
      limit: MAX_ROUTES,
      modes: plan.modesCSV()
    }, function(err, data) {
      if (err) {
        plan.emit('error', err);
        debug(err);
        callback(err);
      } else if (data.options.length < 1) {
        window.alert('No trips found for route between ' + plan.from() +
          ' and ' + plan.to() +
          ' at the requested hours!\n\nIf the trip takes longer than the given time window, it will not display any results.'
        );
        plan.routes(null);
        plan.patterns(null);
      } else {
        debug('<-- updated routes');
        plan.routes(data.options);

        // Add the profile to the options
        options.profile = data;

        // get the patterns
        otp.patterns(options, function(err, patterns) {
          if (err) {
            debug(err);
            callback(err);
          } else {
            plan.patterns(patterns);
            callback();
          }
        });
      }
    });
  } else {
    if (!plan.fromIsValid() && plan.from().length > 0) plan.geocode('from');
    if (!plan.toIsValid() && plan.to().length > 0) plan.geocode('to');
    debug('<-- updating routes not completed: from/to ll does not exist');
  }
}, 25);

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
 * Save Journey
 */

Plan.prototype.saveJourney = function(callback) {
  var opts = {};
  for (var key in this.attrs) {
    if (key === 'routes' || key === 'patterns' || key.indexOf('to') === 0 ||
      key.indexOf('from') === 0) {
      continue;
    }
    opts[key] = this.attrs[key];
  }

  // Create new journey
  var journey = new Journey({
    locations: [{
      _id: this.from_id()
    }, {
      _id: this.to_id()
    }],
    opts: opts
  });

  // Save
  journey.save(callback);
};

/**
 * Store in localStorage. Restrict this I/O to once every 25ms.
 */

Plan.prototype.store = debounce(function(name) {
  debug('--> storing plan');

  // convert to "JSON", remove routes & patterns
  var json = {};
  for (var key in this.attrs) {
    if (key === 'routes' || key === 'patterns') continue;
    json[key] = this.attrs[key];
  }

  // if we've created a commuter object, save to the commuter
  var commuter = session.commuter();
  if (commuter) {
    json._commuter = commuter._id();
    commuter.opts(json);
    commuter.save();
  }

  // save in local storage
  store('plan', json);

  // track the change
  analytics.track('plan.' + name + ' changed', json);

  debug('<-- stored plan');
}, 25);

/**
 * Clear localStorage
 */

Plan.prototype.clearStore = function() {
  store('plan', null);
};

/**
 * Valid coordinates
 */

Plan.prototype.validCoordinates = function() {
  return this.fromIsValid() && this.toIsValid();
};

/**
 * From is valid
 */

Plan.prototype.fromIsValid = function() {
  var from = this.from_ll();
  var valid = !!from && !!from.lat && !!from.lng;
  this.from_valid(valid);
  return valid;
};

/**
 * To is valid
 */

Plan.prototype.toIsValid = function() {
  var to = this.to_ll();
  return !!to && !!to.lat && !!to.lng;
};

/**
 * Modes as a CSV
 */

Plan.prototype.modesCSV = function() {
  var modes = [];
  if (this.bike()) modes.push('BICYCLE');
  if (this.bus()) modes.push('BUS');
  if (this.train()) modes.push('TRAINISH');
  if (this.walk()) modes.push('WALK');
  if (this.car()) modes.push('CAR');

  return modes.join(',');
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
