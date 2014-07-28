var analytics = require('analytics');
var config = require('config');
var d3 = require('d3');
var debug = require('debug')(config.name() + ':plan:update-routes');
var formatProfile = require('format-otp-profile');
var otp = require('otp');
var ProcessProfile = require('otp-profile-score');
var Route = require('route');

var DEFAULT_ROUTES = require('./routes');

/**
 * Max routes & patterns to show
 */

var MAX_ROUTES = localStorage.getItem('max_routes') || 3;
var MAX_PATTERNS = localStorage.getItem('max_patterns') || MAX_ROUTES;

/**
 * New ProcessProfile object
 */

var processProfile = new ProcessProfile();

/**
 * Scale calories
 */

processProfile.scaleCalories = d3.scale.sqrt().domain([0, 100, 150]).range([0, 1, 0]).exponent(2);

/**
 * Expose `updateRoutes`
 */

module.exports = updateRoutes;

/**
 * Last run
 */

var lastRun = {};

/**
 * Update routes
 */

function updateRoutes(plan, opts, callback) {
  opts = opts || {};
  callback = callback || function() {};

  if (!plan.validCoordinates()) {
    if (!plan.fromIsValid() && plan.from().length > 0) plan.geocode('from');
    if (!plan.toIsValid() && plan.to().length > 0) plan.geocode('to');

    return callback('Updating routes failed, invalid addresses.');
  }

  var from = plan.from_ll();
  var to = plan.to_ll();
  var startTime = plan.start_time();
  var endTime = plan.end_time();
  var date = nextDate(plan.days());
  var modes = opts.modes || plan.modesCSV();

  // Set the process profile time window
  processProfile.settings.timeWindow = (endTime - startTime) * 60;

  // Convert the hours into strings
  startTime += ':00';
  endTime += endTime === 24 ? ':59' : ':00';

  // Pattern options
  var options = {
    from: {
      lat: from.lat,
      lon: from.lng,
      name: 'From'
    },
    to: {
      lat: to.lat,
      lon: to.lng,
      name: 'To'
    },
    routes: DEFAULT_ROUTES
  };

  debug('--> updating routes from %s to %s on %s between %s and %s', plan.from(),
    plan.to(),
    date, startTime, endTime);

  otp.profile({
    bikeSpeed: plan.bike_speed(),
    from: options.from,
    to: options.to,
    startTime: startTime,
    endTime: endTime,
    date: date,
    orderBy: 'AVG',
    limit: MAX_ROUTES,
    modes: modes,
    walkSpeed: plan.walk_speed()
  }, function(err, data) {
    if (err) {
      plan.emit('error', err);
      debug(err);
      callback(err);
    } else if (data.options.length < 1) {
      plan.routes(null);
      plan.patterns(null);
      callback('No trips found for route between ' + plan.from() + ' and ' +
        plan.to() +
        ' at the requested hours!\n\nIf the trip takes longer than the given time window, it will not display any results.'
      );
    } else {
      // Track the commute
      analytics.track('commute', {
        from: {
          address: plan.from(),
          coordinate: from
        },
        to: {
          address: plan.to(),
          coordinate: to
        },
        modes: modes,
        time: {
          start: startTime,
          end: endTime
        },
        date: date,
        scoring: {
          factors: processProfile.factors,
          settings: processProfile.settings
        },
        bikeSpeed: plan.bike_speed(),
        walkSpeed: plan.walk_speed(),
        results: data.options.length
      });

      // Process & format the results
      data.options = processProfile.processOptions(data.options);

      var routes = [];
      for (var i = 0; i < data.options.length; i++) {
        // Create a new Route object for each option
        routes.push(new Route(formatProfile(data.options[i])));
      }

      // Save the routes
      plan.routes(routes);
      debug('<-- updated routes');

      // Add the profile to the options
      options.profile = data;

      // Save the URL
      plan.saveURL();

      // update the patterns
      updatePatterns(plan, options, callback);
    }
  });
}

/**
 * Update Patterns
 */

function updatePatterns(plan, options, callback) {
  // get the patterns
  otp.patterns(options, function(err, patterns) {
    if (err) {
      debug(err);
      callback(err);
    } else {
      plan.patterns(patterns);
      callback(null, patterns);
    }
  });
}

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
