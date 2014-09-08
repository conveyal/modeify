var analytics = require('analytics');
var config = require('config');
var convert = require('convert');
var debug = require('debug')(config.name() + ':plan:update-routes');
var formatProfile = require('format-otp-profile');
var otp = require('otp');
var Route = require('route');

/**
 * Expose `updateRoutes`
 */

module.exports = updateRoutes;

/**
 * Update routes
 */

function updateRoutes(plan, opts, callback) {
  opts = opts || {};
  var done = function() {
    plan.emit('updating options complete');
    if (callback) callback.apply(null, arguments);
  };

  if (!plan.validCoordinates()) {
    if (!plan.fromIsValid() && plan.from().length > 0) plan.geocode('from');
    if (!plan.toIsValid() && plan.to().length > 0) plan.geocode('to');

    return done('Updating routes failed, invalid addresses.');
  }

  // For event handlers
  plan.emit('updating options');

  var from = plan.from_ll();
  var to = plan.to_ll();
  var startTime = plan.start_time();
  var endTime = plan.end_time();
  var date = nextDate(plan.days());
  var modes = opts.modes || plan.modesCSV();
  var scorer = plan.scorer();

  // Convert the hours into strings
  startTime += ':00';
  endTime = endTime === 24 ? '23:59' : endTime + ':00';

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
    }
  };

  debug('--> updating routes from %s to %s on %s between %s and %s', plan.from(),
    plan.to(),
    date, startTime, endTime);

  otp({
    bikeSpeed: scorer.rates.bikeSpeed,
    from: options.from,
    to: options.to,
    startTime: startTime,
    endTime: endTime,
    date: date,
    modes: modes,
    walkSpeed: scorer.rates.walkSpeed
  }, function(err, data) {
    if (err) {
      debug(err);
      done(err);
    } else if (!data || data.options.length < 1) {
      plan.journey(null);
      plan.options(null);
      done('No trips found for route between ' + plan.from() + ' and ' +
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
          factors: scorer.factors,
          rates: scorer.rates
        },
        results: data.options.length
      });

      // Add ids to options
      data.options.forEach(function(o, i) {
        if (o.transit && o.transit.length > 0) {
          o.id = i + '_transit';
        } else {
          o.id = i;
        }
      });

      // Process & format the results
      data.options = scorer.processOptions(data.options);

      // TODO: Remove....wait why?
      data.options = data.options.filter(function(o) {
        var a = o.access[0];
        switch (a.mode) {
          case 'BICYCLE':
            if (a.time < 300) return false;
            break;
          case 'WALK':
            if (a.time > 2700) return false;
        }
        return true;
      });

      // Populate segments
      populateSegments(data.options, data.journey);

      // Create a new Route object for each option
      for (var i = 0; i < data.options.length; i++)
        data.options[i] = new Route(formatProfile(data.options[i]));

      // Save the URL
      plan.saveURL();

      plan.options(data.options);
      plan.journey(data.journey);

      debug('<-- updated routes');
      done(null, data);
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

/**
 * Populate segments
 */

function populateSegments(options, journey) {
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (!option.transit || option.transit.length < 1) continue;

    for (var j = 0; j < option.transit.length; j++) {
      var segment = option.transit[j];

      for (var k = 0; k < segment.segmentPatterns.length; k++) {
        var pattern = segment.segmentPatterns[k];
        var patternId = pattern.patternId;
        if (!patternId) continue;

        var routeId = getRouteId(patternId, journey.patterns);
        if (!routeId) continue;

        routeId = routeId.split(':');
        var agency = routeId[0].toLowerCase();
        var line = routeId[1].toLowerCase();

        routeId = routeId[0] + ':' + routeId[1];
        var route = getRoute(routeId, journey.routes);
        if (!route) continue;

        pattern.longName = route.route_long_name;
        pattern.shortName = route.route_short_name;

        pattern.color = convert.routeToColor(route.route_type, agency, line,
          route.route_color);
        pattern.shield = getRouteShield(agency, route);
      }
    }
  }
}

function getRouteId(patternId, patterns) {
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];
    if (pattern.pattern_id === patternId) return pattern.route_id;
  }
}

function getRoute(routeId, routes) {
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if (route.route_id === routeId) return route;
  }
}

function getRouteShield(agency, route) {
  switch (agency) {
    case 'dc':
      if (route.route_type === 1) return 'M';
      return route.route_short_name; // For buses
    default:
      return route.route_short_name;
  }
}
