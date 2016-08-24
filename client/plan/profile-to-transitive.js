/**
 * Convert OTP data into a consumable format
 *
 * @param {Object} options
 * @return {Object} data
 */

module.exports = function ({
  from,
  patterns,
  profile,
  routes,
  to
}) {
  const options = profile.options
  const streetEdgeMap = {}

  const uniqueRouteIds = new Set(patterns.map((pattern) => pattern.routeId))
  const allStops = patterns.reduce((stops, pattern) => stops.concat(pattern.stops), [])
  const uniqueStopIds = new Set(allStops.map((stop) => getStopId(stop)))
  const places = [
    formatPlace('from', from),
    formatPlace('to', to),
    ...getBikeRentalStations(options)
  ].filter((place) => !!place)

  // Collect journeys
  const journeys = profile.options.reduce(function (journeys, option, optionIndex) {
    // handle non-transit option as a special case
    if (!option.transit) {
      // create separate journey for each non-transit mode contained in this option
      return journeys.concat(option.access.map(function (leg) {
        if (isDirectAccessMode(leg.mode)) {
          return processNonTransitOption(streetEdgeMap, leg, optionIndex)
        } else {
          return false
        }
      }).filter((journey) => !!journey))
    } else {
      // process option as transit journey

      const journeyId = optionIndex + '_transit'
      const journey = {
        journey_id: journeyId,
        journey_name: option.summary || journeyId,
        segments: []
      }

      // Add the access segment
      if (from && option.access) {
        const bestAccess = option.access[0] // assume the first returned access leg is the best
        const firstPattern = option.transit[0].segmentPatterns[0]
        const boardStop = findId(patterns, firstPattern.patternId).stops[firstPattern.fromIndex]

        const accessFrom = {
          type: 'PLACE',
          place_id: 'from'
        }
        const accessTo = {
          type: 'STOP',
          stop_id: getStopId(boardStop)
        }

        const accessSegments = processAccessEgress(streetEdgeMap, bestAccess, accessFrom, accessTo)
        journey.segments = journey.segments.concat(accessSegments)
      }

      option.transit.forEach(function (segment, segmentIndex) {
        // construct a collection of 'typical' patterns for each route that serves this segment
        const routePatterns = segment.segmentPatterns.reduce(function (routePatterns, segmentPattern) {
          const pattern = findId(patterns, segmentPattern.patternId)

          if (pattern.routeId in routePatterns) { // if we already have a pattern for this route
            // replace the existing pattern only if the new one has more trips
            if (segmentPattern.nTrips > routePatterns[pattern.routeId].nTrips) {
              routePatterns[pattern.routeId] = segmentPattern
            }
          } else { // otherwise, store this pattern as the initial typical pattern for its route
            routePatterns[pattern.routeId] = segmentPattern
          }

          return routePatterns
        }, {})

        journey.segments.push({
          type: 'TRANSIT',
          patterns: Object.values(routePatterns).map(formatSegmentPattern)
        })

        // Add a walk segment for the transfer, if needed
        if (option.transit.length > segmentIndex + 1) {
          const currentFirstPattern = segment.segmentPatterns[0]
          const alightStop = findId(patterns, currentFirstPattern.patternId).stops[currentFirstPattern.toIndex]

          const nextSegment = option.transit[segmentIndex + 1]
          const nextFirstPattern = nextSegment.segmentPatterns[0]
          const boardStop = findId(patterns, nextFirstPattern.patternId).stops[nextFirstPattern.fromIndex]

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
      if (to && option.egress) {
        const bestEgress = option.egress[0] // assume the first returned egress leg is the best
        const lastPattern = option.transit[option.transit.length - 1].segmentPatterns[0]
        const alightStop = findId(patterns, lastPattern.patternId).stops[lastPattern.toIndex]

        const egressFrom = {
          type: 'STOP',
          stop_id: getStopId(alightStop)
        }
        const egressTo = {
          type: 'PLACE',
          place_id: 'to'
        }

        const egressSegments = processAccessEgress(streetEdgeMap, bestEgress, egressFrom, egressTo)
        journey.segments = journey.segments.concat(egressSegments)
      }

      // Add the journey
      return journeys.concat(journey)
    }
  }, [])

  return {
    journeys,
    patterns: patterns.map(formatPattern),
    places,
    routes: [...uniqueRouteIds]
      .map((id) => routes.find((route) => id === route.id))
      .map(formatRoute),
    stops: [...uniqueStopIds]
      .map((id) => allStops.find((stop) => id === getStopId(id)))
      .map(formatStop),
    streetEdges: Object.keys(streetEdgeMap).map(function (edgeId) {
      const edge = streetEdgeMap[edgeId]
      return {
        edge_id: edgeId,
        geometry: edge.geometry
      }
    })
  }
}

function processAccessEgress (streetEdgeMap, leg, from, to) {
  if (leg.mode === 'BICYCLE_RENT') {
    return processBikeRentalSegment(streetEdgeMap, leg.streetEdges, from, to)
  } else {
    const journeySegment = constructJourneySegment(streetEdgeMap, leg.mode, from, to, leg.streetEdges)
    return [journeySegment]
  }
}

function processNonTransitOption (streetEdgeMap, leg, optionIndex) {
  const fromPlace = constructPlaceEndpoint('from')
  const toPlace = constructPlaceEndpoint('to')

  return {
    journey_id: optionIndex + '_' + leg.mode.toLowerCase(),
    journey_name: leg.mode.toUpperCase(),
    segments: leg.mode === 'BICYCLE_RENT'
      ? processBikeRentalSegment(streetEdgeMap, leg.streetEdges, fromPlace, toPlace)
      : [constructJourneySegment(streetEdgeMap, leg.mode, fromPlace, toPlace, leg.streetEdges)]
  }
}

function getBikeRentalStations (options) {
  return options
    .reduce((stations, option) => {
      const allLegs = [...(option.access || []), ...(option.egress || [])]
      const bikeLegs = allLegs.filter((leg) => leg.mode === 'BICYCLE_RENT')
      if (bikeLegs.length > 0) {
        return stations
          .concat(option.streetEdges.reduce((stations, edge) => {
            if (edge.bikeRentalOffStation) {
              return stations.concat(formatBikeRentalStation(edge.bikeRentalOffStation))
            } else if (edge.bikeRentalOnStation) {
              return stations.concat(formatBikeRentalStation(edge.bikeRentalOnStation))
            }
            return stations
          }, []))
      }
      return stations
    }, [])
}

function processBikeRentalSegment (streetEdgeMap, edges, from, to) {
  const preWalkEdges = []
  const bikeRentalEdges = []
  const postWalkEdges = []
  let currentLeg = preWalkEdges
  let onStationEndpoint, offStationEndpoint
  edges.forEach(function (edge) {
    if (edge.bikeRentalOffStation) {
      currentLeg = postWalkEdges
      offStationEndpoint = constructPlaceEndpoint(`bicycle_rent_station_${edge.bikeRentalOffStation.id}`)
    }
    currentLeg.push(edge)
    if (edge.bikeRentalOnStation) {
      currentLeg = bikeRentalEdges
      onStationEndpoint = constructPlaceEndpoint(`bicycle_rent_station_${edge.bikeRentalOnStation.id}`)
    }
  })

  const journeySegments = []

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

function formatBikeRentalStation (station) {
  return {
    place_id: `bicycle_rent_station_${station.id}`,
    place_name: station.name,
    place_lat: station.lat,
    place_lon: station.lon
  }
}

function constructJourneySegment (streetEdgeMap, mode, from, to, edges) {
  return {
    type: mode.toUpperCase(),
    from,
    to,
    streetEdges: edges.map((edge) => {
      streetEdgeMap[edge.edgeId] = edge
      return edge.edgeId
    })
  }
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

function isDirectAccessMode (mode) {
  return mode === 'walk' || mode === 'bicycle' || mode === 'car' || mode === 'bicycle_rent'
}

function findId (arr, id) {
  return arr.find((v) => v.id === id)
}

function formatPattern (pattern) {
  return {
    pattern_id: pattern.id,
    pattern_name: pattern.desc,
    route_id: pattern.routeId,
    stops: pattern.stops.map((stop) => {
      return {
        stop_id: getStopId(stop)
      }
    })
  }
}

function formatPlace (id, place) {
  if (place) {
    return {
      place_id: id,
      place_name: place.name,
      place_lon: place.lon,
      place_lat: place.lat
    }
  } else {
    return false
  }
}

function formatRoute (route) {
  return {
    agency_id: route.agency,
    route_id: route.id,
    route_short_name: route.shortName,
    route_long_name: route.longName,
    route_type: getGtfsRouteType(route.mode),
    route_color: route.color
  }
}

function formatSegmentPattern (segmentPattern) {
  return {
    pattern_id: segmentPattern.patternId,
    from_stop_index: segmentPattern.fromIndex,
    to_stop_index: segmentPattern.toIndex
  }
}

function formatStop (stop) {
  return {
    stop_id: getStopId(stop),
    stop_name: stop.name,
    stop_lat: stop.lat,
    stop_lon: stop.lon
  }
}
