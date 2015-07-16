var Batch = require('batch');
var clone, each;
var superagent = require('superagent');

try {
  clone = require('clone');
  each = require('each');
} catch (e) {
  clone = require('component-clone');
  each = require('component-each');
}

/**
 * Expose `Profiler`
 */

module.exports = Profiler;

/**
 * "store" routes & pattens
 */

var store = {
    allPatterns: {},
  patterns: {},
  routes: null
};

/**
 * Profiler
 *
 * @param {Object} options
 */

function Profiler(opts) {
  if (!(this instanceof Profiler)) return new Profiler(opts);
  if (!opts.host) throw new Error('Profiler requires a host.');

  this.host = opts.host;
  this.limit = opts.limit || 3;
}

/**
 * Get a journey.
 *
 * @param {Object} options
 * @param {Function} callback
 */

Profiler.prototype.journey = function(opts, callback) {
  var batch = new Batch();
  var profiler = this;

  // If a profile isn't passed, retrieve the profile
  batch.push(function(done) {
    if (opts.profile) {
      done(null, opts.profile);
    } else {
      profiler.profile(opts, done);
    }
  });

  // Get routes asynchronously
  batch.push(function(done) {
    if (opts.routes) {
      done(null, opts.routes);
    } else {
      profiler.routes(done);
    }
  });

  batch.end(function(err, results) {
    if (err) {
      callback(err);
    } else {
      opts.profile = results[0];
      opts.routes = results[1];

      profiler.patterns(opts, function(err, patterns) {
        if (err) {
          callback(err);
        } else {
          opts.patterns = patterns;
          callback(null, profiler.convertOtpData(opts));
        }
      });
    }
  });
};

/**
 * Get a journey based on a plan.
 *
 * @param {Object} plan
 * @param {Function} callback
 */

Profiler.prototype.journeyWithPlan = function(plan, callback) {
  var batch = new Batch();
  var profiler = this;

  // Get routes asynchronously
  batch.push(function(done) {
    profiler.routes(done);
  });

  // Get patterns asynchronously                                                                                                                                
  batch.push(function(done) {
      profiler.allPatterns(done);
  });

  batch.end(function(err, results) {
    if (err) {
      callback(err);
    } else {
      plan.routes = results[0];

      profiler.patternsFromPlan(plan, function(err, patterns) {
        if (err) {
          callback(err);
        } else {
          plan.patterns = patterns;
          callback(null, profiler.convertOtpData(plan));
        }
      });
    }
  });
};

/**
 * Convert OTP data into a consumable format
 *
 * @param {Object} options
 * @return {Object} data
 */

Profiler.prototype.convertOtpData = function(opts) {
  var self = this;
  self.data = {
    journeys: [],
    patterns: [],
    places: [],
    routes: [],
    stops: [],
    streetEdges: []
  };

  self.streetEdgeMap = {};

  var routeIds = [];
  var stopIds = [];

  // Merge consecutive non-transit legs
  var itineraries = opts.plan.itineraries;
/*  var legs, newLegs, newLeg, steps, potentialMode;
  for (var i = 0; i < itineraries.length; i++) {
    legs = itineraries[i].legs;
    newLegs = [];

    for (var j = 0; j < legs.length; ) {
      if (legs[j].transitLeg || legs[j].mode === 'CAR') {
        newLegs.push(legs[j]);
        j++;
        continue;
      }

      newLeg = legs[j];
      potentialMode = legs[j].mode;
      j++;
      while (j < legs.length && (legs[j].mode === 'WALK' || legs[j].mode === 'BICYCLE')) {
        potentialMode = legs[j].mode;
        newLeg.steps = newLeg.steps.concat(legs[j].steps);
        newLeg.to = legs[j].to;
        newLeg.endTime = legs[j].endTime;
	newLeg.distance += legs[j].distance;
	newLeg.duration += legs[j].duration;
        j++;
      }
      if (j === legs.length) {
	newLeg.mode = potentialMode;
      }
      newLegs.push(newLeg);

    }
    itineraries[i].legs = newLegs;
  }
*/
  // Get a pattern by passing in the id
  var getPattern = function(id) {
    for (var i = 0; i < opts.patterns.length; i++) {
      var pattern = opts.patterns[i];
      if (pattern.id === id) return pattern;
    }
  };

  // Collect all unique stops
  each(opts.patterns, function(pattern) {
    // Store all used route ids
    if (routeIds.indexOf(pattern.routeId) === -1) routeIds.push(pattern.routeId);

    each(pattern.stops, function(stop) {
      var stopId = getStopId(stop);
      if (stopIds.indexOf(stopId) === -1) {
        self.data.stops.push({
          stop_id: stopId,
          stop_name: stop.name,
          stop_lat: stop.lat,
          stop_lon: stop.lon
        });
        stopIds.push(stopId);
      }
    });
  });

  // For legs with "osm:123"-like 'to' names
  each(itineraries, function (itinerary) {
    var leg;
    var stopId;
    for (var i = 0; i < itinerary.legs.length; i++) {
      leg = itinerary.legs[i];
      if (leg.to && !leg.to.stopId) {
        stopId = getStopId(leg.to);
        if (stopIds.indexOf(stopId) === -1) {
          self.data.stops.push({
            stop_id: stopId,
            stop_name: leg.to.name,
            stop_lat: leg.to.lat,
            stop_lon: leg.to.lon
          });
        }
        stopIds.push(stopId);
      }
    }
  });

  // Collect routes
  each(opts.routes, function(route) {
    if (routeIds.indexOf(route.id) !== -1) {
      self.data.routes.push({
        agency_id: route.agency,
        route_id: route.id,
        route_short_name: route.shortName || '',
        route_long_name: route.longName,
        route_type: getGtfsRouteType(route.mode),
        route_color: route.color
      });
    }
  });

  // Collect patterns
  each(opts.patterns, function(pattern) {
    var obj = {
      pattern_id: pattern.id,
      stops: []
    };

    if (pattern.desc) obj.pattern_name = pattern.desc;
    if (pattern.routeId) obj.route_id = pattern.routeId;

    each(pattern.stops, function(stop) {
      obj.stops.push({
        stop_id: getStopId(stop)
      });
    });

    self.data.patterns.push(obj);
  });

  // Collect places
  // TODO: Remove this
  if (opts.plan.from) {
    self.data.places.push({
      place_id: 'from',
      place_name: opts.plan.from.name,
      place_lat: opts.plan.from.lat,
      place_lon: opts.plan.from.lon
    });
  }

  if (opts.plan.to) {
    self.data.places.push({
      place_id: 'to',
      place_name: opts.plan.to.name,
      place_lat: opts.plan.to.lat,
      place_lon: opts.plan.to.lon
    });
  }

  // Collect journeys
//  each(opts.profile.options, function(option, optionIndex) {
  each(opts.plan.itineraries, function(option, optionIndex) {

    // handle non-transit option as a special case
    if (option.legs.length === 1) {
      var journeyId = optionIndex + '_' + option.legs[0].mode.toLowerCase();
      var journey = {
        journey_id: journeyId,
        journey_name: option.summary || journeyId,
        segments: []
      };
      var leg = option.legs[0];

      var from = {
        type: 'PLACE',
        place_id: 'from'
      };
      var to = {
        type: 'PLACE',
        place_id: 'to',
	  to: leg.to
      };

      var accessSegments = self.processAccessEgress(leg, from, to);
      journey.segments = journey.segments.concat(accessSegments);
      self.data.journeys.push(journey);
      return;
    }

    // process option as transit journey

    var journeyId = optionIndex + '_transit';
    var journey = {
      journey_id: journeyId,
      journey_name: option.summary || journeyId,
      segments: []
    };

    // Add the access segment
    if (option.legs[0] && !option.legs[0].transitLeg) {
      var bestAccess = option.legs[0]; // assume the first returned access leg is the best

      var accessFrom = {
        type: 'PLACE',
        place_id: 'from'
      };
      var accessTo = {
        type: 'STOP',
        stop_id: bestAccess.to.stopId || bestAccess.to.name,
	  to: bestAccess.to
      };

      var accessSegments = self.processAccessEgress(bestAccess, accessFrom, accessTo);
      journey.segments = journey.segments.concat(accessSegments);
    }

    each(option.legs, function(leg, segmentIndex) {
	var routePatterns = {};
        var segment;
        var pattern;
	var matchingPatterns = [];
	var findTripId = function (tripId, trips) {
	    for (var i = 0; i < trips.length; i++) {
		if (tripId === trips[i].id) return i;
            }
	    return -1;
        }
        if (leg.transitLeg) {
	    for (var attr in store.patterns) {
		if (attr.indexOf(leg.agencyId + ':' + leg.routeId) !== -1) 
		    matchingPatterns.push(attr);
	    }

	    for (var i = 0; i < matchingPatterns.length; i++) {
		if (findTripId(leg.agencyId + ':' + leg.tripId, store.patterns[matchingPatterns[i]].trips) !== -1) {
		    pattern = store.patterns[matchingPatterns[i]];
		    break;
		}
	    }
	    routePatterns[pattern.routeId] = pattern;

	    var patterns = [];
	    for(var routeId in routePatterns) {
		var segmentPattern = routePatterns[routeId];
		patterns.push({
		    pattern_id: segmentPattern.id,
		    from_stop_index: leg.from.stopIndex,
		    to_stop_index: leg.to.stopIndex
		});
	    }

	    journey.segments.push({
		type: 'TRANSIT',
		patterns: patterns
	    });

        } else {
	    if (segmentIndex < opts.plan.itineraries[parseInt(journey.journey_id.split('_')[0])].legs.length - 1 &&
	       segmentIndex > 0) {
		var fromStopId = getStopId(leg.from);
		var toStopId = getStopId(leg.to);
		var from = {
		    type: 'STOP',
//		    stop_id: leg.from.stopId
		    stop_id: fromStopId
		};
		var to = {
		    type: 'STOP',
//		    stop_id: leg.to.stopId,
		    stop_id: toStopId,
		    to: leg.to
		};
		journey.segments = journey.segments.concat(self.processAccessEgress(leg, from, to, true));
	    }
	}
    });

    // Add the egress segment
    if (!option.legs[option.legs.length - 1].transitLeg) {
      var lastIndex = option.legs.length - 1;
      var bestEgress = option.legs[lastIndex];

      var egressFrom = {
        type: 'STOP',
        stop_id: bestEgress.from.stopId || bestEgress.from.name
      };
      var egressTo = {
        type: 'PLACE',
	place_id: 'to',
	  to: bestEgress.to
      };

      var egressSegments = self.processAccessEgress(bestEgress, egressFrom, egressTo);
      journey.segments = journey.segments.concat(egressSegments);
    }

    // Add the journey
    self.data.journeys.push(journey);
  });

  // populate the street edge array from the map
  each(self.streetEdgeMap, function(edgeId) {
    var edge = self.streetEdgeMap[edgeId];
    self.data.streetEdges.push({
      edge_id: edgeId,
      geometry: edge.geometry
    });
  });

  return self.data;
};

Profiler.prototype.processAccessEgress = function(leg, from, to, transfer) {

  if(leg.mode === "BICYCLE_RENT") {
    return this.processBikeRentalSegment(leg.streetEdges, from, to);
  }
  else {
/*    var segment = {
      type: leg.mode.toUpperCase(),
      from: from,
      to: to,
      turnPoints : getTurnPoints(leg.steps)
//      turnPoints : getTurnPoints(leg.walkSteps)
    };

    if(leg.legGeometry) segment.geometry = leg.legGeometry;*/
      var journeySegment;
    if (transfer) {
      journeySegment = this.constructJourneySegment(leg.mode, from, to, leg.steps, leg);
    } else {
      journeySegment = this.constructJourneySegment(leg.mode, from, to, leg.steps);
    }
    return [journeySegment];
//    return [segment];
  }
};

Profiler.prototype.processNonTransitOption = function(option, optionIndex) {
  var journeyId = optionIndex + '_' + option.mode.toLowerCase();
  var journey = {
    journey_id: journeyId,
    journey_name: option.mode.toUpperCase(),
    segments: []
  };

  var fromPlace = constructPlaceEndpoint('from');
  var toPlace = constructPlaceEndpoint('to');

  if(option.mode === "BICYCLE_RENT") {
    var segments = this.processBikeRentalSegment(option.streetEdges, fromPlace, toPlace);
    journey.segments = journey.segments.concat(segments);
  }
  else {
    /*var journeySegment = {
      type: option.mode.toUpperCase(),
      from: fromPlace,
      to: toPlace,
      turnPoints : getTurnPoints(option.walkSteps)
    };
    if(option.geometry) journeySegment.geometry = option.geometry;*/
    var journeySegment = this.constructJourneySegment(option.mode, fromPlace, toPlace, option.streetEdges);
    journey.segments.push(journeySegment);
  }

  return journey;
};

Profiler.prototype.processBikeRentalSegment = function(edges, from, to) {
  var self = this;

  var preWalkEdges = [], bikeRentalEdges = [], postWalkEdges = [];
  var currentLeg = preWalkEdges;
  var onStationEndpoint, offStationEndpoint;
  each(edges, function(edge) {
    if(edge.bikeRentalOnStation) {
      currentLeg = bikeRentalEdges;
      var onStation = self.addBikeRentalStation(edge.bikeRentalOnStation);
      onStationEndpoint = constructPlaceEndpoint(onStation.place_id);
    }
    currentLeg.push(edge);
    if(edge.bikeRentalOffStation) {
      currentLeg = postWalkEdges;
      var offStation = self.addBikeRentalStation(edge.bikeRentalOffStation);
      offStationEndpoint = constructPlaceEndpoint(offStation.place_id);
    }
  });

  var journeySegments = [];

  // add the walk leg to the "on" station, if applicable
  if(preWalkEdges.length > 0 ) {
    if(!onStationEndpoint) {
      return [self.constructJourneySegment('WALK', from, to, preWalkEdges)];
    }
    journeySegments.push(self.constructJourneySegment('WALK', from, onStationEndpoint, preWalkEdges));
  }

  // add the main bike leg
  if(bikeRentalEdges.length > 0 && onStationEndpoint && offStationEndpoint) {
    journeySegments.push(self.constructJourneySegment('BICYCLE_RENT', onStationEndpoint, offStationEndpoint, bikeRentalEdges));
  }

  // add the walk leg from the "off" station, if applicable
  if(postWalkEdges && offStationEndpoint) {
    journeySegments.push(self.constructJourneySegment('WALK', offStationEndpoint, to, postWalkEdges));
  }

  return journeySegments;
};

Profiler.prototype.addBikeRentalStation = function(station) {
  var placeId = 'bicycle_rent_station_' + station.id;

  // check if the station already exists
  var existing = null;
  each(this.data.places, function(place) {
    if(place.place_id === placeId) existing = place;
  });

  if(existing) return existing;

  var place = {
    place_id: placeId,
    place_name: station.name,
    place_lat: station.lat,
    place_lon: station.lon
  };
  this.data.places.push(place);

  return place;
};

Profiler.prototype.constructJourneySegment = function(mode, from, to, edges, leg) {
  var self = this;
  var edge, encodedGeometry;

  var journeySegment = {
    type: mode.toUpperCase(),
    from: from,
    to: to,
    streetEdges: []
  };

  if (leg) {
    edge ={
      edgeId: leg.legGeometry.points,
      geometry: leg.legGeometry
    };
    self.streetEdgeMap[edge.edgeId] = edge;
    journeySegment.streetEdges.push(edge.edgeId);
    return journeySegment;
  }

  for (var i = 0; i < edges.length; i++) {
    edge = edges[i];
    if (i === edges.length -1) {
      encodedGeometry = Profiler.prototype.encodeGeometry(
	  [
	      {lat: edge.lat, lng: edge.lon},
	      {lat: to.to.lat, lng: to.to.lon}
	  ]
      );
    } else {
      encodedGeometry = Profiler.prototype.encodeGeometry(
	  [
	      {lat: edge.lat, lng: edge.lon},
	      {lat: edges[i+1].lat, lng: edges[i+1].lon}
	  ]
      );
    }
      edge.edgeId = encodedGeometry;
      edge.geometry = {
	length: 2,
	points: encodedGeometry
      };
    if(!(edge.edgeId in self.streetEdgeMap)) {
      self.streetEdgeMap[edge.edgeId] = edge;
    }
    journeySegment.streetEdges.push(edge.edgeId);
    
  }
  return journeySegment;
};

function constructPlaceEndpoint(id) {
  return {
    type: 'PLACE',
    place_id: id
  };
}

function getTurnPoints(walkSteps) {
  var turnPoints = [];
  if(walkSteps) {
    for(var i = 1; i < walkSteps.length; i++) {
      var step = walkSteps[i];
      turnPoints.push({
        lat: step.lat,
        lon: step.lon,
        relativeDirection: step.relativeDirection,
        inStreet: walkSteps[i-1].streetName,
        outStreet: step.streetName
      });
    }
  }
  return turnPoints;
}

function getStopId(stop) {
//  return stop.cluster || stop.id;
  return stop.id || stop.stopId || stop.name || stop.cluster;
}

/**
 * Patterns
 *
 * @param {Object} options
 * @param {Function} callback
 */

Profiler.prototype.patterns = function(opts, callback) {
  var batch = new Batch();
  var profiler = this;

  // Get all unique pattern IDs
  var ids = this.getUniquePatternIdsFromPlan(opts.profile);

  // Load all the patterns
  each(ids, function(id) {
    batch.push(function(done) {
      profiler.pattern(id, done);
    });
  });

  batch.end(callback);
};

/**
 * Patterns from plan
 *
 * @param {Object} plan
 * @param {Function} callback
 */

Profiler.prototype.patternsFromPlan = function(plan, callback) {
  var batch = new Batch();
  var profiler = this;

  // Get all unique pattern IDs
  var ids = this.getUniquePatternIdsFromPlan(plan);

  // Load all the patterns
  each(ids, function(id) {
    batch.push(function(done) {
      profiler.pattern(id, done);
    });
  });

  batch.end(callback);
};

/**
 * All Patterns
 *
 * @param {Function} callback
 */

Profiler.prototype.allPatterns = function(callback) {
    this.request('/index/patterns', function(err, patterns) {
      if (err) {
        callback(err);
      } else {
        for (var i = 0; i < patterns.length; i++) {
          store.allPatterns[patterns[i].id] = patterns[i];
        }
	  callback(null, patterns);
      }
    });
};

/**
 * Get unique pattern ids from a profile
 *
 * @param {Object} profile
 * @return {Array} of pattern ids
 */

Profiler.prototype.getUniquePatternIds = function(profile) {
  var ids = [];

  // Iterate over each option and add the pattern if it does not already exist
  each(profile.options, function(option, index) {
    each(option.transit, function(transitSegment) {
      each(transitSegment.segmentPatterns, function(pattern) {
        if (ids.indexOf(pattern.patternId) === -1) {
          ids.push(pattern.patternId);
        }
      });
    });
  });

  return ids;
};

/**
 * Get unique pattern ids from a plan
 *
 * @param {Object} plan
 * @return {Array} of pattern ids
 */

Profiler.prototype.getUniquePatternIdsFromPlan = function(plan) {
  var ids = [];
    var plan = plan.plan;
    var uniquePatterns = [];

    for (var i = 0; i < plan.itineraries.length; i++) {
        for (var j = 0; j < plan.itineraries[i].legs.length; j++) {
            if (plan.itineraries[i].legs[j].transitLeg) {
                for (var attr in store.allPatterns) {
                    if (attr.indexOf(
                        plan.itineraries[i].legs[j].agencyId + ':' + plan.itineraries[i].legs[j].routeId
                    ) !== -1 && uniquePatterns.indexOf(attr) === -1) {
                        uniquePatterns.push(attr);
                    }
                }
            }
        }
    }

  return uniquePatterns;
};

/**
 * Load a pattern
 *
 * @param {String} id
 * @param {Function} callback
 */

Profiler.prototype.pattern = function(id, callback) {
  if (store.patterns[id]) {
    callback(null, store.patterns[id]);
  } else {
    this.request('/index/patterns/' + encodeURIComponent(id), function(err,
      pattern) {
      if (err) {
        callback(err);
      } else {
        store.patterns[id] = pattern;
        callback(null, pattern);
      }
    });
  }
};

/**
 * Profile
 *
 * @param {Object} query parameters to pass in
 * @param {Function} callback
 */

Profiler.prototype.profile = function(params, callback) {
  var qs = clone(params);
  qs.from = params.from.lat + ',' + params.from.lon;
  qs.to = params.to.lat + ',' + params.to.lon;

  // Options limit
  qs.limit = qs.limit || this.limit;

  // Remove invalid options
  delete qs.profile;
  delete qs.routes;

  // Request the profile
  this.request('/profile', qs, callback);
};

/**
 * Routes. Get an index of all routes available.
 *
 * @param {Function} callback
 */

Profiler.prototype.routes = function(callback) {
  if (store.routes !== null) {
    callback(null, store.routes);
  } else {
    this.request('/index/routes', function(err, routes) {
      if (err) {
        callback(err);
      } else {
        store.routes = routes;
        callback(null, routes);
      }
    });
  }
};

/**
 * Request
 *
 * @param {String} path
 * @param {Function} callback
 */

Profiler.prototype.request = function(path, params, callback) {
  if (arguments.length === 2) {
    callback = params;
    params = null;
  }

  superagent
    .get(this.host + path)
    .query(params)
    .end(function(err, res) {
      if (err || res.error || !res.ok) {
        callback(err || res.error || res.text, res);
      } else {
        callback(null, res.body);
      }
    });
};

/**
 * Get GTFS Route Type
 *
 * @param {String} mode
 */

function getGtfsRouteType(mode) {
  switch (mode) {
    case 'TRAM':
      return 0;
    case 'SUBWAY':
      return 1;
    case 'RAIL':
      return 2;
    case 'BUS':
      return 3;
    case 'FERRY':
      return 4;
    case 'CABLE_CAR':
      return 5;
    case 'GONDOLA':
      return 6;
    case 'FUNICULAR':
      return 7;
  }
}
function defaultOptions (options) {
    if (typeof options === 'number') {
        // Legacy                                                                                                                               
        options = {
            precision: options
        };
    } else {
        options = options || {};
    }

    options.precision = options.precision || 5;
    options.factor = options.factor || Math.pow(10, options.precision);
    options.dimension = options.dimension || 2;
    return options;
}

Profiler.prototype.encodeGeometry = function (points, options) {
    options = defaultOptions(options);

    var flatPoints = [];
    for (var i = 0, len = points.length; i < len; ++i) {
        var point = points[i];

        if (options.dimension === 2) {
            flatPoints.push(point.lat || point[0]);
            flatPoints.push(point.lng || point[1]);
        } else {
            for (var dim = 0; dim < options.dimension; ++dim) {
                flatPoints.push(point[dim]);
            }
        }
    }

    return encodeDeltas(flatPoints, options);
}

function encodeDeltas(numbers, options) {
    options = defaultOptions(options);

    var lastNumbers = [];

    for (var i = 0, len = numbers.length; i < len;) {
        for (var d = 0; d < options.dimension; ++d, ++i) {
            var num = numbers[i];
            var delta = num - (lastNumbers[d] || 0);
            lastNumbers[d] = num;

            numbers[i] = delta;
        }
    }

    return encodeFloats(numbers, options);
}

function encodeFloats(numbers, options) {
    options = defaultOptions(options);

    for (var i = 0, len = numbers.length; i < len; ++i) {
        numbers[i] = Math.round(numbers[i] * options.factor);
    }

    return encodeSignedIntegers(numbers);
}

function encodeSignedIntegers(numbers) {
    for (var i = 0, len = numbers.length; i < len; ++i) {
        var num = numbers[i];
        numbers[i] = (num < 0) ? ~(num << 1) : (num << 1);
    }

    return encodeUnsignedIntegers(numbers);
}

function encodeUnsignedIntegers(numbers) {
    var encoded = '';
    for (var i = 0, len = numbers.length; i < len; ++i) {
        encoded += encodeUnsignedInteger(numbers[i]);
    }
    return encoded;
}

function encodeUnsignedInteger (num) {
    var value, encoded = '';
    while (num >= 0x20) {
        value = (0x20 | (num & 0x1f)) + 63;
        encoded += (String.fromCharCode(value));
        num >>= 5;
    }
    value = num + 63;
    encoded += (String.fromCharCode(value));

    return encoded;
}

Profiler.prototype.decodeGeometry = function (encoded, options) {
    options = defaultOptions(options);

    var flatPoints = decodeDeltas(encoded, options);

    var points = [];
    for (var i = 0, len = flatPoints.length; i + (options.dimension - 1) < len;) {
	var point = [];

	for (var dim = 0; dim < options.dimension; ++dim) {
	    point.push(flatPoints[i++]);
	    }

	points.push(point);
	}

    return points;
}

function decodeDeltas(encoded, options) {
    options = defaultOptions(options);

    var lastNumbers = [];

    var numbers = decodeFloats(encoded, options);
    for (var i = 0, len = numbers.length; i < len;) {
	for (var d = 0; d < options.dimension; ++d, ++i) {
	    numbers[i] = Math.round((lastNumbers[d] = numbers[i] + (lastNumbers[d] || 0)) * options.factor) / options.factor;
	    }
	}

    return numbers;
}

function decodeFloats(encoded, options) {
    options = defaultOptions(options);

    var numbers = decodeSignedIntegers(encoded);
    for (var i = 0, len = numbers.length; i < len; ++i) {
	numbers[i] /= options.factor;
	}

    return numbers;
}


function decodeSignedIntegers(encoded) {
    var numbers = decodeUnsignedIntegers(encoded);

    for (var i = 0, len = numbers.length; i < len; ++i) {
	var num = numbers[i];
	numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1);
	}

    return numbers;
}

function decodeUnsignedIntegers(encoded) {
    var numbers = [];

    var current = 0;
    var shift = 0;

    for (var i = 0, len = encoded.length; i < len; ++i) {
	var b = encoded.charCodeAt(i) - 63;

	current |= (b & 0x1f) << shift;

	if (b < 0x20) {
	    numbers.push(current);
	    current = 0;
	    shift = 0;
	    } else {
		shift += 5;
		}
	}

    return numbers;
}
