var config = require('config');
var debug = require('debug')(config.name() + ':plan:update-routes');
var formatProfile = require('format-otp-profile');
var otp = require('otp');
var ProcessProfile = require('otp-profile-score');

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
 * Expose `updateRoutes`
 */

module.exports = updateRoutes;

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

  var from = opts.from || plan.from_ll();
  var to = opts.to || plan.to_ll();
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

  debug('--- updating routes from %s to %s on %s between %s and %s', from, to,
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
      // Process & format the results
      data.options = processProfile.processOptions(data.options);
      data.options = formatProfile(data.options);

      debug('<-- updated routes');
      plan.routes(data.options);

      // Add the profile to the options
      options.profile = data;

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
