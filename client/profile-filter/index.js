var profileFormatter = require('profile-formatter')

var THIRTY_MINUTES = 30 * 60

/**
 * Filter, format, and score the results.
 */

module.exports = function profileFilter (options, scorer) {
  var FILTER_RESULTS = window.localStorage
    ? window.localStorage.getItem('filterResults') !== 'false'
    : true

  options.forEach(function (o, i) {
    o = profileFormatter.option(o)

    if (FILTER_RESULTS) {
      o = filterUnreasonableAccessModes(o)
      o = filterBikeIfBikeshareIsAvailable(o)
      o = filterBikeshareIfNoBiking(o)
    }
  })

  options = scorer.processOptions(options)

  if (FILTER_RESULTS) {
    options = filterDriveToTransitTrips(options)
    options = filterBikeToTransitTrips(options)
    options = filterTripsWithShortTransitLegs(options)
  }

  // Add the ids last so that they're in appropriate order
  options.forEach(addId)

  return options
}

function addId (o, i) {
  if (o.transit && o.transit.length > 0) {
    o.id = i + '_transit'
  } else {
    o.id = i
  }
  return o
}

/**
 * Filter bike to transit trips
 */

function filterBikeToTransitTrips (opts) {
  var directBikeDistance = Infinity

  opts.forEach(function (o) {
    if (o.access[0].mode === 'BICYCLE' && (!o.transit || o.transit.length === 0)) {
      directBikeDistance = o.bikeDistance
    }
  })

  return opts.filter(function (o) {
    if (o.access[0].mode !== 'BICYCLE' || !o.transit || o.transit.length === 0) return true
    return o.bikeDistance < (0.75 * directBikeDistance)
  })
}

/**
 * Filter car based trips that are slower than the fastest non car trip * 1.25.
 */

function filterDriveToTransitTrips (opts) {
  var fastestNonCarTrip = Infinity
  var directDriveDistance = Infinity

  opts.forEach(function (o) {
    if (o.access[0].mode === 'CAR') {
      if (!o.transit || o.transit.length === 0) {
        directDriveDistance = o.driveDistance
      }
    } else if (o.time < fastestNonCarTrip) {
      fastestNonCarTrip = o.time
    }
  })

  return opts.filter(function (o) {
    if (o.access[0].mode !== 'CAR_PARK') return true
    if (o.driveDistance > directDriveDistance * 1.5) return false
    return o.time < fastestNonCarTrip
  })
}

/**
 * Filter transit trips with longer average ride times than average wait times.
 */

function filterTripsWithShortTransitLegs (opts) {
  var filtered = 0
  var maxFiltered = opts.length - 3
  return opts.filter(function (o) {
    if (filtered >= maxFiltered) return true
    if (!o.transit) return true

    for (var i = 0; i < o.transit.length; i++) {
      if (o.transit[i].rideStats.avg < o.transit[i].waitStats.avg / 3) {
        filtered++
        return false
      }
    }
    return true
  })
}

/**
 * Filter out access modes on transit trips that we deem "unreasonable". We'll only filter the access mode if there is another mode access mode available for that trip. Each access mode has it's own filter:
 * - Car: < 10 minute drive
 * - Bike: < 10 minute ride or a similar bikeshare journey
 * - Bikeshare: < 5 minute ride
 * - Walk: > 60 minute walk
 *
 * @param {Object} option Full option with all access modes.
 * @return {Object} option Option with only reasonable access modes.
 */

function filterUnreasonableAccessModes (o) {
  // Add ids to options
  if (o.transit && o.transit.length > 0) {
    // Filter access modes if they're not reasonable
    filterAccessMode(o, 'CAR_PARK', function (a) {
      return a.time < 600
    })
    filterAccessMode(o, 'BICYCLE', function (a) {
      return a.time < 600
    })
    filterAccessMode(o, 'BICYCLE_RENT', function (a) {
      return a.time < 300
    })
    filterAccessMode(o, 'WALK', function (a) {
      return a.time > 3600
    })
  }
  return o
}

function filterAccessMode (option, mode, filter) {
  if (option.access && option.access.length > 1) {
    option.access = option.access.filter(function (a) {
      return a.mode !== mode || !filter(a)
    })
  }
}

/**
 * Filter bikeshare when biking does not occur. TODO: Remove this when fixed in OTP.
 *
 */

function filterBikeshareIfNoBiking (option) {
  if (option.access && option.access.length > 1) {
    option.access = option.access.filter(hasBicycleRent)
  }
  if (option.egress && option.egress.length > 1) {
    option.egress = option.egress.filter(hasBicycleRent)
  }

  return option
}

function hasBicycleRent (a) {
  if (a.mode === 'BICYCLE_RENT') {
    return a.streetEdges.reduce(function (m, se) {
      return m || se.mode === 'BICYCLE'
    }, false)
  }
  return true
}

/**
 * Filter bike trips where bikeshare exists and is less than 1.5 slower.
 *
 * @param {Object} option
 * @return {Object} option Filtered
 */

function filterBikeIfBikeshareIsAvailable (option) {
  if (option.access && option.access.length > 1) {
    var bikeTime = false
    var bikeshareTime = false
    option.access.forEach(function (a) {
      if (a.mode === 'BICYCLE_RENT') {
        bikeshareTime = a.time
      } else if (a.mode === 'BICYCLE') {
        bikeTime = a.time
      }
    })

    if (bikeTime && bikeshareTime) {
      var filterMode = bikeshareTime > THIRTY_MINUTES ? 'BICYCLE_RENT' : 'BICYCLE'
      option.access = option.access.filter(function (a) {
        return a.mode !== filterMode
      })
    }
  }
  return option
}
