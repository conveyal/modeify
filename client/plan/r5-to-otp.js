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
    routes: [],
    patterns: r5.patterns
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
