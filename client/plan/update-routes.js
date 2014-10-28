var analytics = require('analytics');
var convert = require('convert');
var formatProfile = require('format-otp-profile');
var log = require('log')('plan:update-routes');
var otp = require('otp');
var Route = require('route');
var session = require('session');

/**
 * Expose `updateRoutes`
 */

module.exports = updateRoutes;

/**
 * Update routes
 */

function updateRoutes(plan, opts, callback) {
  opts = opts || {};

  var done = function(err, res) {
    if (err) {
      err = generateErrorMessage(plan, res);
    }

    plan.emit('updating options complete', {
      err: err,
      res: res
    });

    plan.loading(false);

    if (session.commuter().profile().welcome_wizard_complete) plan.saveURL();
    if (callback) callback.call(null, err, res);
  };

  // Check for valid locations
  if (!plan.validCoordinates()) {
    plan.set({
      options: [],
      journey: {
        places: plan.generatePlaces()
      }
    });
    return done('Invalid coordinates.');
  }

  // For event handlers
  plan.loading(true);
  plan.emit('updating options');

  var query = plan.generateQuery();
  var scorer = plan.scorer();

  otp(query, function(err, data) {
    if (err || !data || data.options.length < 1) {
      plan.set({
        options: [],
        journey: {
          places: plan.generatePlaces()
        }
      });
      done(err, data);
    } else {
      // Track the commute
      analytics.track('commute', {
        query: query,
        results: data.options.length
      });

      data.options.forEach(function(o, i) {
        // Add ids to options
        if (o.transit && o.transit.length > 0) {
          o.id = i + '_transit';

          // Filter access modes if they're not reasonable
          filterMode(o, 'CAR', function(a) {
            return a.time < 600;
          });
          filterMode(o, 'BICYCLE', function(a) {
            return a.time < 300;
          });
          filterMode(o, 'WALK', function(a) {
            return a.time > 3600;
          });
        } else {
          o.id = i;
        }
        o = formatProfile.option(o);
      });

      // Score the results
      data.options = scorer.processOptions(data.options);

      // Get the car data
      var driveOption = new Route(data.options.filter(function(o) {
        return o.access[0].mode === 'CAR' && (!o.transit || o.transit.length < 1);
      })[0]);

      // Remove the car option if car is turned off
      if (!plan.car()) {
        data.options = data.options.filter(function(o) {
          return o.access[0].mode !== 'CAR';
        });
      }

      // Populate segments
      populateSegments(data.options, data.journey);

      // Create a new Route object for each option
      for (var i = 0; i < data.options.length; i++) {
        data.options[i] = new Route(data.options[i]);

        data.options[i].setCarData({
          cost: driveOption.cost(),
          emissions: driveOption.emissions(),
          time: driveOption.average()
        });
      }

      // Format the journey
      data.journey = formatProfile.journey(data.journey);

      // Store the results
      plan.set(data);

      log('<-- updated routes');
      done(null, data);
    }
  });
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
        var routeId = getRouteId(patternId, journey.patterns);

        routeId = routeId.split(':');
        var agency = routeId[0].toLowerCase();
        var line = routeId[1].toLowerCase();

        routeId = routeId[0] + ':' + routeId[1];
        var route = getRoute(routeId, journey.routes);

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
  if (agency === 'dc' && route.route_type === 1) return 'M';
  return route.route_short_name || route.route_long_name.toUpperCase();
}

function filterMode(option, mode, filter) {
  if (option.access && option.access.length > 1) {
    option.access = option.access.filter(function(a) {
      return a.mode !== mode || !filter(a);
    });
  }
}

function generateErrorMessage(plan, response) {
  var msg = 'No results! ';
  var responseText = response ? response.text : '';

  if (responseText.indexOf('VertexNotFoundException') !== -1) {
    msg += 'The <strong>';
    msg += responseText.indexOf('[from]') !== -1 ? 'from' : 'to';
    msg += '</strong> address entered is outside the supported region of CarFreeAtoZ.';
  } else if (!plan.validCoordinates()) {
    msg += plan.fromIsValid() ? 'To' : 'From';
    msg += ' address could not be found. Please enter a valid address.';
  } else if (!plan.bus() || !plan.train()) {
    msg += 'Try turning all <strong>transit</strong> modes on.';
  } else if (!plan.bike()) {
    msg += 'Add biking to see bike-to-transit results.';
  } else if (!plan.car()) {
    msg += 'Unfortunately we were unable to find non-driving results. Try turning on driving.';
  } else if (plan.end_time() - plan.start_time() < 2) {
    msg += 'Make sure the hours you specified are large enough to encompass the length of the journey.';
  } else if (plan.days() !== 'M—F') {
    msg += 'Transit runs less often on the weekends. Try switching to a weekday.';
  }

  return msg;
}
