var profileFormatter = require('./profile-formatter')
var haversine = require('haversine')
var PriorityQueue = require('priorityqueuejs')

/**
 * Filter, format, and score the results.
 */

module.exports = function profileFilter (options, scorer, filterResults) {
  options.forEach(function (o, i) {
    o = profileFormatter.option(o)

    if (filterResults) {
      o = filterUnreasonableAccessModes(o)
      o = filterBikeshareIfNoBiking(o)
    }
  })

  options = scorer.processOptions(options)

  if (filterResults) {
    options = filterDriveToTransitTrips(options)
    options = filterBikeToTransitTrips(options)
    options = filterTripsWithShortTransitLegs(options)
    options = filterExcessiveTransitOptions(options)
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
    if (o.driveDistance > directDriveDistance) return false
    return o.time < fastestNonCarTrip * 1.5
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
      // filter short transit legs
      var dist = haversine({
        latitude: o.transit[i].from.lat,
        longitude: o.transit[i].from.lon
      }, {
        latitude: o.transit[i].to.lat,
        longitude: o.transit[i].to.lon
      })
      if (dist < 0.5) return false

      // filter long transfers
      if (o.transit[i].middle) {
        if (o.transit[i].middle.duration > 300) return false
      }

      // old logic based on rideStats
      /* if (o.transit[i].rideStats.avg < o.transit[i].waitStats.avg / 3) {
        filtered++
        return false
      } */
    }
    return true
  })
}

function filterExcessiveTransitOptions (opts) {
  var comparator = function (a, b) {
    // FIXME: OTP and R5 responses should be interchangeable
    if (a.time && b.time) return b.time - a.time
    return b.itinerary[0].duration - a.itinerary[0].duration
  }
  var bikeToTransitOpts = new PriorityQueue(comparator)
  var bikeshareToTransitOpts = new PriorityQueue(comparator)
  var walkToTransitOpts = new PriorityQueue(comparator)
  opts = opts.filter(function (o) {
    if (!o.transit) return true

    if (o.access && o.access.length === 1 && o.access[0].mode === 'WALK') {
      walkToTransitOpts.enq(o)
      return false
    } else if (o.access && o.access.length === 1 && o.access[0].mode === 'BICYCLE') {
      if (o.access[0].distance > 500000) bikeToTransitOpts.enq(o)
      return false
    } else if (o.access && o.access.length === 1 && o.access[0].mode === 'BICYCLE_RENT') {
      if (o.access[0].distance > 500000) bikeshareToTransitOpts.enq(o)
      return false
    }

    return true
  })

  var count = 0
  var max = 3
  while (bikeToTransitOpts.size() > 0 && count < max - 1) {
    opts.push(bikeToTransitOpts.deq())
    count++
  }
  count = 0
  while (bikeshareToTransitOpts.size() > 0 && count < max - 1) {
    opts.push(bikeshareToTransitOpts.deq())
    count++
  }
  count = 0
  while (walkToTransitOpts.size() > 0 && count < max) {
    opts.push(walkToTransitOpts.deq())
    count++
  }

  return opts
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
