const polyline = require('polyline')
const populateTransitSegments = require('../otp').populateTransitSegments

module.exports = function (r5) {
  const routeIdxToId = {}
  r5.patterns.forEach((pattern) => {
    routeIdxToId[pattern.routeIdx] = pattern.routeId
  })

  const optionsSplitByAccessAndEgressMode = r5.options.reduce((options, option) => {
    for (let i = 0; i < option.access.length; i++) {
      options.push(Object.assign({}, option, {
        access: [option.access[i]],
        itinerary: [option.itinerary[i] || option.itinerary[0]]
      }))
    }
    return options
  }, [])

  const profile = optionsSplitByAccessAndEgressMode.map((option) => {
    if (option.transit !== null && option.transit.length > 0) {
      const legs = option.transit.length
      const totalWaitingTime = option.itinerary[0].waitingTime
      const totalTransitTime = option.itinerary[0].transitTime
      const totalWalkTime = option.itinerary[0].walkTime
      option.transit = option.transit.map((transitSegment) => {
        if (transitSegment.mode === null) transitSegment.mode = 'SUBWAY'
        if (transitSegment.waitStats === null) transitSegment.waitStats = stats(totalWaitingTime / legs)
        if (transitSegment.rideStats === null) transitSegment.rideStats = stats(totalTransitTime / legs)
        transitSegment.routes = transitSegment.routes.map((route) => Object.assign({}, route, {
          id: routeIdxToId[route.routeIdx]
        }))
        transitSegment.walkTime = totalWalkTime / legs
        transitSegment.walkDistance = 0
        transitSegment.segmentPatterns = transitSegment.segmentPatterns.map((pattern) => Object.assign({}, pattern, {
          routeId: routeIdxToId[pattern.routeIdx]
        }))
        transitSegment.fromName = transitSegment.from.name
        transitSegment.toName = transitSegment.to.name
        return transitSegment
      })
    } else {
      delete option.transit
    }
    formatPortion(option, 'access')
    formatPortion(option, 'egress')

    return option
  })

  const routes = profile
    .filter((option) => option.transit && option.transit.length > 0)
    .reduce((legs, option) => legs.concat(option.transit), [])
    .reduce((routes, leg) => routes.concat(leg.routes), [])
    .map((route) => Object.assign({}, route, {
      id: routeIdxToId[route.routeIdx],
      color: route.routeColor
    }))
  const patterns = r5.patterns.map((pattern) => {
    return Object.assign({}, pattern, {
      id: String(pattern.tripPatternIdx)
    })
  })
  return {
    profile: populateTransitSegments(profile, patterns, routes),
    routes,
    patterns
  }
}

function stats (val) {
  return {
    avg: val,
    min: val,
    max: val,
    num: val
  }
}

function formatPortion (option, portion) {
  if (option[portion] && option[portion].length > 0) {
    option[portion] // access or egress
      .forEach((leg) => {
        leg.time = leg.duration || 0
        if (leg.streetEdges && leg.streetEdges.length > 0) {
          leg.streetEdges = leg.streetEdges.map(formatStreetEdge)
        }
      })
  }
}

function formatStreetEdge (streetEdge) {
  if (streetEdge.geometry === undefined) {
    const line = polyline.decode(streetEdge.geometryPolyline)
    streetEdge.geometry = {
      points: streetEdge.geometryPolyline,
      length: line.length
    }
    delete streetEdge.geometryPolyline
    streetEdge.distance = streetEdge.distance / 1000 // to meters
  }
  return streetEdge
}
