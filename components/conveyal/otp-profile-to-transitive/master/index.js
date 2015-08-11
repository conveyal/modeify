var each

try {
  each = require('each')
} catch (e) {
  each = require('component-each')
}

/**
 * Convert OTP data into a consumable format
 *
 * @param {Object} options
 * @return {Object} data
 */

module.exports = function (opts) {
  var data = {
    journeys: [],
    patterns: [],
    places: [],
    routes: [],
    stops: [],
    streetEdges: []
  }

  var streetEdgeMap = {}

  var routeIds = []
  var stopIds = []

  // Get a pattern by passing in the id
  var getPattern = function (id) {
    for (var i = 0; i < opts.patterns.length; i++) {
      var pattern = opts.patterns[i]
      if (pattern.id === id) return pattern
    }
  }

  // Collect all unique stops
  each(opts.patterns, function (pattern) {
    // Store all used route ids
    if (routeIds.indexOf(pattern.routeId) === -1) routeIds.push(pattern.routeId)

    each(pattern.stops, function (stop) {
      var stopId = getStopId(stop)
      if (stopIds.indexOf(stopId) === -1) {
        data.stops.push({
          stop_id: stopId,
          stop_name: stop.name,
          stop_lat: stop.lat,
          stop_lon: stop.lon
        })
        stopIds.push(stopId)
      }
    })
  })

  // Collect routes
  each(opts.routes, function (route) {
    if (routeIds.indexOf(route.id) !== -1) {
      data.routes.push({
        agency_id: route.agency,
        route_id: route.id,
        route_short_name: route.shortName,
        route_long_name: route.longName,
        route_type: getGtfsRouteType(route.mode),
        route_color: route.color
      })
    }
  })

  // Collect patterns
  each(opts.patterns, function (pattern) {
    var obj = {
      pattern_id: pattern.id,
      stops: []
    }

    if (pattern.desc) obj.pattern_name = pattern.desc
    if (pattern.routeId) obj.route_id = pattern.routeId

    each(pattern.stops, function (stop) {
      obj.stops.push({
        stop_id: getStopId(stop)
      })
    })

    data.patterns.push(obj)
  })

  // Collect places
  // TODO: Remove this
  if (opts.from) {
    data.places.push({
      place_id: 'from',
      place_name: opts.from.name,
      place_lat: opts.from.lat,
      place_lon: opts.from.lon
    })
  }

  if (opts.to) {
    data.places.push({
      place_id: 'to',
      place_name: opts.to.name,
      place_lat: opts.to.lat,
      place_lon: opts.to.lon
    })
  }

  // Collect journeys
  each(opts.profile.options, function (option, optionIndex) {
    // handle non-transit option as a special case
    if (!option.hasOwnProperty('transit')) {
      // create separate journey for each non-transit mode contained in this option
      each(option.access, function (leg) {
        var mode = leg.mode.toUpperCase()
        if (mode === 'WALK' || mode === 'BICYCLE' || mode === 'CAR' || mode === 'BICYCLE_RENT') {
          data.journeys.push(processNonTransitOption(data, streetEdgeMap, leg, optionIndex))
        }
      })
      return
    }

    // process option as transit journey

    var journeyId = optionIndex + '_transit'
    var journey = {
      journey_id: journeyId,
      journey_name: option.summary || journeyId,
      segments: []
    }

    // Add the access segment
    if (opts.from && option.access) {
      var bestAccess = option.access[0] // assume the first returned access leg is the best
      var firstPattern = option.transit[0].segmentPatterns[0]
      var boardStop = getPattern(firstPattern.patternId).stops[firstPattern.fromIndex]

      var accessFrom = {
        type: 'PLACE',
        place_id: 'from'
      }
      var accessTo = {
        type: 'STOP',
        stop_id: getStopId(boardStop)
      }

      var accessSegments = processAccessEgress(data, streetEdgeMap, bestAccess, accessFrom, accessTo)
      journey.segments = journey.segments.concat(accessSegments)
    }

    each(option.transit, function (segment, segmentIndex) {
      // construct a collection of 'typical' patterns for each route that serves this segment
      var routePatterns = {} // maps routeId to a segmentPattern object
      each(segment.segmentPatterns, function (segmentPattern) {
        var pattern = getPattern(segmentPattern.patternId)

        if (pattern.routeId in routePatterns) { // if we already have a pattern for this route
          // replace the existing pattern only if the new one has more trips
          if (segmentPattern.nTrips > routePatterns[pattern.routeId].nTrips) {
            routePatterns[pattern.routeId] = segmentPattern
          }
        } else { // otherwise, store this pattern as the initial typical pattern for its route
          routePatterns[pattern.routeId] = segmentPattern
        }
      })

      var patterns = []
      for (var routeId in routePatterns) {
        var segmentPattern = routePatterns[routeId]
        patterns.push({
          pattern_id: segmentPattern.patternId,
          from_stop_index: segmentPattern.fromIndex,
          to_stop_index: segmentPattern.toIndex
        })
      }

      journey.segments.push({
        type: 'TRANSIT',
        patterns: patterns
      })

      // Add a walk segment for the transfer, if needed
      if (option.transit.length > segmentIndex + 1) {
        var currentFirstPattern = segment.segmentPatterns[0]
        var alightStop = getPattern(currentFirstPattern.patternId).stops[currentFirstPattern.toIndex]
        var nextSegment = option.transit[segmentIndex + 1]
        var nextFirstPattern = nextSegment.segmentPatterns[0]
        var boardStop = getPattern(nextFirstPattern.patternId).stops[nextFirstPattern.fromIndex]

        if (alightStop.id !== boardStop.id) {
          journey.segments.push({
            type: 'WALK',
            from: {
              type: 'STOP',
              stop_id: getStopId(alightStop)
            },
            to: {
              type: 'STOP',
              stop_id: getStopId(boardStop)
            }
          })
        }
      }
    })

    // Add the egress segment
    if (opts.to && option.egress) {
      var bestEgress = option.egress[0] // assume the first returned egress leg is the best
      var lastPattern = option.transit[option.transit.length - 1].segmentPatterns[0]
      var alightStop = getPattern(lastPattern.patternId).stops[lastPattern.toIndex]

      var egressFrom = {
        type: 'STOP',
        stop_id: getStopId(alightStop)
      }
      var egressTo = {
        type: 'PLACE',
        place_id: 'to'
      }

      var egressSegments = processAccessEgress(data, streetEdgeMap, bestEgress, egressFrom, egressTo)
      journey.segments = journey.segments.concat(egressSegments)
    }

    // Add the journey
    data.journeys.push(journey)
  })

  // populate the street edge array from the map
  each(streetEdgeMap, function (edgeId) {
    var edge = streetEdgeMap[edgeId]
    data.streetEdges.push({
      edge_id: edgeId,
      geometry: edge.geometry
    })
  })

  return data
}

function processAccessEgress (data, streetEdgeMap, leg, from, to) {
  if (leg.mode === 'BICYCLE_RENT') {
    return processBikeRentalSegment(data, leg.streetEdges, from, to)
  } else {
    var journeySegment = constructJourneySegment(streetEdgeMap, leg.mode, from, to, leg.streetEdges)
    return [journeySegment]
  }
}

function processNonTransitOption (data, streetEdgeMap, option, optionIndex) {
  var journeyId = optionIndex + '_' + option.mode.toLowerCase()
  var journey = {
    journey_id: journeyId,
    journey_name: option.mode.toUpperCase(),
    segments: []
  }

  var fromPlace = constructPlaceEndpoint('from')
  var toPlace = constructPlaceEndpoint('to')

  if (option.mode === 'BICYCLE_RENT') {
    var segments = processBikeRentalSegment(data, streetEdgeMap, option.streetEdges, fromPlace, toPlace)
    journey.segments = journey.segments.concat(segments)
  } else {
    var journeySegment = constructJourneySegment(streetEdgeMap, option.mode, fromPlace, toPlace, option.streetEdges)
    journey.segments.push(journeySegment)
  }

  return journey
}

function processBikeRentalSegment (data, streetEdgeMap, edges, from, to) {
  var preWalkEdges = []
  var bikeRentalEdges = []
  var postWalkEdges = []
  var currentLeg = preWalkEdges
  var onStationEndpoint, offStationEndpoint
  each(edges, function (edge) {
    if (edge.bikeRentalOffStation) {
      currentLeg = postWalkEdges
      var offStation = addBikeRentalStation(data, edge.bikeRentalOffStation)
      offStationEndpoint = constructPlaceEndpoint(offStation.place_id)
    }
    currentLeg.push(edge)
    if (edge.bikeRentalOnStation) {
      currentLeg = bikeRentalEdges
      var onStation = addBikeRentalStation(data, edge.bikeRentalOnStation)
      onStationEndpoint = constructPlaceEndpoint(onStation.place_id)
    }
  })

  var journeySegments = []

  // add the walk leg to the "on" station, if applicable
  if (preWalkEdges.length > 0) {
    if (!onStationEndpoint) {
      return [constructJourneySegment(streetEdgeMap, 'WALK', from, to, preWalkEdges)]
    }
    journeySegments.push(constructJourneySegment(streetEdgeMap, 'WALK', from, onStationEndpoint, preWalkEdges))
  }

  // add the main bike leg
  if (bikeRentalEdges.length > 0 && onStationEndpoint && offStationEndpoint) {
    journeySegments.push(constructJourneySegment(streetEdgeMap, 'BICYCLE_RENT', onStationEndpoint, offStationEndpoint, bikeRentalEdges))
  }

  // add the walk leg from the "off" station, if applicable
  if (postWalkEdges && offStationEndpoint) {
    journeySegments.push(constructJourneySegment(streetEdgeMap, 'WALK', offStationEndpoint, to, postWalkEdges))
  }

  return journeySegments
}

function addBikeRentalStation (data, station) {
  var placeId = 'bicycle_rent_station_' + station.id

  // check if the station already exists
  var existing = null
  each(data.places, function (place) {
    if (place.place_id === placeId) existing = place
  })

  if (existing) return existing

  var place = {
    place_id: placeId,
    place_name: station.name,
    place_lat: station.lat,
    place_lon: station.lon
  }
  data.places.push(place)

  return place
}

function constructJourneySegment (streetEdgeMap, mode, from, to, edges) {
  var journeySegment = {
    type: mode.toUpperCase(),
    from: from,
    to: to,
    streetEdges: []
  }

  each(edges, function (edge) {
    if (!(edge.edgeId in streetEdgeMap)) {
      streetEdgeMap[edge.edgeId] = edge
    }
    journeySegment.streetEdges.push(edge.edgeId)
  })

  return journeySegment
}

function constructPlaceEndpoint (id) {
  return {
    type: 'PLACE',
    place_id: id
  }
}

function getStopId (stop) {
  return stop.cluster || stop.id
}

/**
 * Get GTFS Route Type
 *
 * @param {String} mode
 */

function getGtfsRouteType (mode) {
  switch (mode) {
    case 'TRAM':
      return 0
    case 'SUBWAY':
      return 1
    case 'RAIL':
      return 2
    case 'BUS':
      return 3
    case 'FERRY':
      return 4
    case 'CABLE_CAR':
      return 5
    case 'GONDOLA':
      return 6
    case 'FUNICULAR':
      return 7
  }
}
