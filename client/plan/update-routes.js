var analytics = require('analytics');
var convert = require('convert');
var log = require('./client/log')('plan:update-routes');
var message = require('./client/messages')('plan:update-routes');
var otp = require('otp');
var profileFilter = require('profile-filter');
var profileFormatter = require('profile-formatter');
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
      analytics.track('Failed to Find Route', {
        error: err,
        plan: plan.generateQuery()
      });
    }

    plan.emit('updating options complete', {
      err: err,
      res: res
    });

    plan.loading(false);
    plan.saveURL();

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
    return done(message('invalid-coordinates'));
  }

  // For event handlers
  plan.loading(true);
  plan.emit('updating options');

  var query = plan.generateQuery();
  var scorer = plan.scorer();

  otp.plan(query, function(err, data) {
      console.log("ENTROOOOOOOOO")
      var planData, itineraries;

     if (err || !data || !data.plan) {
          plan.set({
            options: [],
            journey: {
              places: plan.generatePlaces()
            }
          });
          done(err, data);
     } else {
        planData = {options: []};

        itineraries = data.plan.itineraries;
        module.exports.dataplan = data.options;

        var sesion_plan = JSON.parse(localStorage.getItem('dataplan'));
        if (!(sesion_plan === null)) {
            localStorage.removeItem('dataplan');
        }

        localStorage.setItem('dataplan', JSON.stringify(data.options));

            sesion_plan = JSON.parse(localStorage.getItem('dataplan'));
            console.log("si guarda en storage ->", sesion_plan);




          // Track the commute
          analytics.track('Found Route', {
            plan: '',
            results: data.plan.itineraries.length
        });

        analytics.send_ga({
            category: 'route',
            action: 'calculate route',
            value: 1
        });

	var legs;
	var fare;
	var timeInTransit;
	var bikeTime;
	var bikeDistance;
	var walkTime;
	var walkDistance;
	for (var i = 0; i < itineraries.length; i++) {
	    legs = itineraries[i].legs;
	    timeInTransit = 0;
	    bikeTime = 0;
	    bikeDistance = 0;
	    walkTime = 0;
	    walkDistance = 0;
	    for (var j = 0; j < legs.length; j++) {
		if (legs[j].transitLeg) {
		    timeInTransit += legs[j].duration;
		} else {
		    if (legs[j].mode === 'BICYCLE') {
			bikeTime += legs[j].duration;
			bikeDistance += legs[j].distance;
		    } else if (legs[j].mode === 'WALK') {
			walkTime += legs[j].duration;
			walkDistance += legs[j].distance;
		    }
		}
	    }
	    fare = (itineraries[i].fare ? itineraries[i].fare.fare.regular.cents : 0);
	    planData.options.push(
		new Route({
		    from: data.plan.from.name,
		    to: data.plan.to.name,
		    time: timeInTransit + bikeTime + walkTime,
		    timeInTransit: timeInTransit / 60,
		    cost: fare / 100,
		    transitCost: fare / 100,
		    bikeTime: bikeTime,
		    bikeDistance: bikeDistance,
		    walkDistance: walkDistance,
		    walkTime: walkTime,
		    plan: itineraries[i]
		})
	    );
        }
	plan.set({options: planData.options, journey: data.journey});
	done(null, data);

        analytics.send_ac({
          event_type: 'query',
          url: location.href,
          results: JSON.stringify(data),
          timestamp: (new Date()).toISOString(),
          from_address: plan.from(),
          to_address: plan.to()
        });
    console.log("populateSegments0");
	return;

       //Get the car data
      var driveOption = new Route(data.options.filter(function(o) {
        return o.access[0].mode === 'CAR' && (!o.transit || o.transit.length < 1);
      })[0]);

      // Remove the car option if car is turned off
      if (!plan.car()) {
        data.options = data.options.filter(function(o) {
          return o.access[0].mode !== 'CAR';
        });

        data.journey.journeys = data.journey.journeys.filter(function(o) {
          return o.journey_name.indexOf('CAR') === -1;
        });
      }
        console.log("populateSegments", data.options, data.journey);
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
      data.journey = profileFormatter.journey(data.journey);

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
    console.log("option->", option);
    for (var j = 0; j < option.transit.length; j++) {
      var segment = option.transit[j];

       console.log("segment->", segment);
      for (var k = 0; k < segment.segmentPatterns.length; k++) {
        var pattern = segment.segmentPatterns[k];
        var patternId = pattern.patternId;
            console.log("pattern->", pattern);
          console.log("patternId ->",  patternId );
        var routeId = getRouteId(patternId, journey.patterns);

        routeId = routeId.split(':');
        var agency = routeId[0].toLowerCase();
        var line = routeId[1].toLowerCase();

         console.log("routeId ->", routeId);

        routeId = routeId[0] + ':' + routeId[1];
          console.log("journey.routes", journey.routes)
        var route = getRoute(routeId, journey.routes);

        console.log("routexxx", route);

        pattern.longName = route.route_long_name;
        pattern.shortName = route.route_short_name;

        pattern.color = convert.routeToColor(route.route_type, agency, line,
          route.route_color);
        pattern.shield = getRouteShield(agency, route);

          console.log("pattern.longName", pattern.longName);
          console.log("pattern.shortName", pattern.shortName);
          console.log("pattern.color", pattern.color);
          console.log("pattern.shield", pattern.shield);
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

function generateErrorMessage(plan, response) {
  var msg = 'No results! ';
  var responseText = response ? response.text : '';

  if (responseText.indexOf('VertexNotFoundException') !== -1) {
    msg += 'The <strong>';
    msg += responseText.indexOf('[from]') !== -1 ? 'from' : 'to';
    msg += '</strong> address entered is outside the supported region.';
  } else if (!plan.validCoordinates()) {
    msg += plan.coordinateIsValid(plan.from_ll()) ? 'To' : 'From';
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
