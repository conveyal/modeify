var analytics = require('analytics')
var convert = require('convert')
var log = require('./client/log')('plan:update-routes')
var message = require('./client/messages')('plan:update-routes')
var otp = require('otp')
var profileFilter = require('profile-filter')
var profileFormatter = require('profile-formatter')
var request = require('request')
var Route = require('route')

/**
 * Expose `updateRoutes`
 */

module.exports = updateRoutes

/**
 * Update routes
 */

function updateRoutes (plan, opts, callback) {
  opts = opts || {}

  var done = function (err, res) {
    if (err) {
      err = generateErrorMessage(plan, res)
      analytics.track('Failed to Find Route', {
        error: err,
        plan: plan.generateQuery()
      })
    }

    plan.emit('updating options complete', {
      err: err,
      res: res
    })

    plan.loading(false)
    plan.saveURL()

    if (callback) callback.call(null, err, res)
  }

  // Check for valid locations
  if (!plan.validCoordinates()) {
    plan.set({
      options: [],
      journey: {
        places: plan.generatePlaces()
      }
    })
    return done(message('invalid-coordinates'))
  }

  // For event handlers
  plan.loading(true)
  plan.emit('updating options')

  var driveOption = null
  var query = plan.generateQuery()
  var scorer = plan.scorer()

  otp(query, function (data) {
    data.options = profileFilter(data.options, scorer)
    return data
  }, function (err, data) {
    if (err || !data || data.options.length < 1) {
      plan.set({
        options: [],
        journey: {
          places: plan.generatePlaces()
        }
      })
      done(err, data)
    } else {
      // Track the commute
      analytics.track('Found Route', {
        plan: plan.generateQuery(),
        results: data.options.length
      })

      // Get the car data
      driveOption = window.driveOption = new Route(data.options.filter(function (o) {
        return o.access[0].mode === 'CAR' && (!o.transit || o.transit.length < 1)
      })[0])

      // Remove the car option if car is turned off
      if (!plan.car()) {
        data.options = data.options.filter(function (o) {
          return o.access[0].mode !== 'CAR'
        })

        data.journey.journeys = data.journey.journeys.filter(function (o) {
          return o.journey_name.indexOf('CAR') === -1
        })
      }

      // Populate segments
      populateSegments(data.options, data.journey)

      // Create a new Route object for each option
      for (var i = 0; i < data.options.length; i++) {
        data.options[i] = new Route(data.options[i])

        if (plan.car() && data.options[i].directCar()) {
          data.options[i] = driveOption
        }

        data.options[i].setCarData({
          cost: driveOption.cost(),
          emissions: driveOption.emissions(),
          time: driveOption.average()
        })
      }

      // Format the journey
      data.journey = profileFormatter.journey(data.journey)

      // Store the results
      plan.set(data)

      log('<-- updated routes')
      done(null, data)
    }
  })

  var from_ll = plan.from_ll()
  var to_ll = plan.to_ll()

  request
    .get('/carpool/external-matches', {
      from: from_ll.lng + ',' + from_ll.lat,
      to: to_ll.lng + ',' + to_ll.lat
    }, function (err, res) {
      if (err) {
        log('error finding matches: %e', err)
      } else {
        log('found %d matches', res.body)
        var waitForOtp = setInterval(function () {
          if (driveOption) {
            clearInterval(waitForOtp)
            log('setting external carpool matches')
            driveOption.externalCarpoolMatches(res.body)
          }
        }, 100)
      }
    })
}

/**
 * Populate segments
 */

function populateSegments (options, journey) {
  for (var i = 0; i < options.length; i++) {
    var option = options[i]
    if (!option.transit || option.transit.length < 1) continue

    for (var j = 0; j < option.transit.length; j++) {
      var segment = option.transit[j]

      for (var k = 0; k < segment.segmentPatterns.length; k++) {
        var pattern = segment.segmentPatterns[k]
        var patternId = pattern.patternId
        var routeId = getRouteId(patternId, journey.patterns)

        routeId = routeId.split(':')
        var agency = routeId[0].toLowerCase()
        var line = routeId[1].toLowerCase()

        routeId = routeId[0] + ':' + routeId[1]
        var route = getRoute(routeId, journey.routes)

        pattern.longName = route.route_long_name
        pattern.shortName = route.route_short_name

        pattern.color = convert.routeToColor(route.route_type, agency, line, route.route_color)
        pattern.shield = getRouteShield(agency, route)
      }
    }
  }
}

function getRouteId (patternId, patterns) {
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i]
    if (pattern.pattern_id === patternId) return pattern.route_id
  }
}

function getRoute (routeId, routes) {
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i]
    if (route.route_id === routeId) return route
  }
}

function getRouteShield (agency, route) {
  if (agency === 'dc' && route.route_type === 1) return 'M'
  return route.route_short_name || route.route_long_name.toUpperCase()
}

function generateErrorMessage (plan, response) {
  var msg = 'No results! '
  var responseText = response ? response.text : ''

  if (responseText.indexOf('VertexNotFoundException') !== -1) {
    msg += 'The <strong>'
    msg += responseText.indexOf('[from]') !== -1 ? 'from' : 'to'
    msg += '</strong> address entered is outside the supported region.'
  } else if (!plan.validCoordinates()) {
    msg += plan.coordinateIsValid(plan.from_ll()) ? 'To' : 'From'
    msg += ' address could not be found. Please enter a valid address.'
  } else if (!plan.bus() || !plan.train()) {
    msg += 'Try turning all <strong>transit</strong> modes on.'
  } else if (!plan.bike()) {
    msg += 'Add biking to see bike-to-transit results.'
  } else if (!plan.car()) {
    msg += 'Unfortunately we were unable to find non-driving results. Try turning on driving.'
  } else if (plan.end_time() - plan.start_time() < 2) {
    msg += 'Make sure the hours you specified are large enough to encompass the length of the journey.'
  } else if (plan.days() !== 'M—F') {
    msg += 'Transit runs less often on the weekends. Try switching to a weekday.'
  }

  return msg
}
