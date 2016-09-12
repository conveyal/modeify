module.exports = function (r5) {
  const profile = r5.options.map((option) => {
    if (option.transit !== null && option.transit.length > 0) {
      option.transit = option.transit.map((transitSegment) => {
        if (transitSegment.mode === null) transitSegment.mode = 'SUBWAY'
        if (transitSegment.waitStats === null) transitSegment.waitStats = stats()
        if (transitSegment.rideStats === null) transitSegment.rideStats = stats()
        return transitSegment
      })
    } else {
      delete option.transit
    }
    return option
  })

  return {
    profile,
    routes: profile
      .filter((option) => option.transit && option.transit.length > 0)
      .reduce((legs, option) => legs.concat(option.transit), [])
      .reduce((routes, leg) => routes.concat(leg.routes), [])
      .map((route) => {
        return Object.assign({}, route, {
          id: route.routeIdx,
          color: route.routeColor
        })
      }),
    patterns: r5.patterns.map((pattern) => {
      return Object.assign({}, pattern, {
        id: pattern.tripPatternIdx
      })
    })
  }
}

function stats () {
  return {
    avg: 0,
    min: 0,
    max: 0,
    num: 0
  }
}
