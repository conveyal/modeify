var analytics = require('../analytics')
var haversine = require('../components/trevorgerhardt/haversine/master')
var log = require('../log')('plan:update-routes')
var message = require('../messages')('plan:update-routes')
var request = require('../request')
var Route = require('../route')
var _tr = require('../translate')

/**
 * Expose `updateRoutes`
 */

module.exports = updateRoutes

/**
 * Update routes
 */

function updateRoutes (plan, opts, callback) {
  opts = opts || {}

  const done = function (err, res) {
    if (err) {
      err = generateErrorMessage(plan, res)
      analytics.track('Failed to Find Route', {
        error: err,
        plan: plan.generateQuery()
      })
      plan.clear()
    }

    plan.emit('updating options complete', {
      err: err,
      res: res
    })

    plan.loading(false)
    plan.saveURL()

    if (callback) callback(err, res)
  }

  // Check for valid locations
  if (!plan.validCoordinates()) {
    return done(message('invalid-coordinates'))
  }

  // For event handlers
  plan.loading(true)
  plan.emit('updating options')

  // default is to query r5 only unless specified via 'routers' property in localStorage
  let queryOtp = true
  let queryR5 = false

  const routers = window.localStorage.getItem('routers')
  if (routers) {
    const routersArr = routers.split(',')
    queryOtp = routersArr.indexOf('otp') !== -1
    queryR5 = routersArr.indexOf('r5') !== -1
  }

  const query = plan.generateQuery()
  Object.assign(query, { queryOtp, queryR5 })

  log('-- see raw results here: %s', plan.generateURL())

  request.get('/plan', query, function (err, res) {
    const results = res.body
    const ridepoolMatches = results.ridepoolMatches
    const externalMatches = results.externalMatches

    let journeys
    if (results.otp && !results.r5) { // only OTP results returned
      journeys = results.otp
    } else if (!results.otp && results.r5) { // only R5 results returned
      journeys = results.r5
    } else { // both returned, look for defaultRouter setting in localStorage
      journeys = window.localStorage.getItem('defaultRouter') === 'otp' ? results.otp : results.r5
    }

    const profile = journeys ? journeys.profile : []
    if (err) {
      done(err, res)
    } else if (!results || profile.length < 1) {
      done(message('no-options-found'), res)
    } else {
      if (results.otp) console.log('otp: ' + (results.otp.responseTime / 1000) + ' seconds')
      if (results.r5) console.log('r5: ' + (results.r5.responseTime / 1000) + ' seconds')

      // Track the commute
      analytics.track('Found Route', {
        distance: haversine(query.from.lat, query.from.lon, query.to.lat, query.to.lon),
        plan: plan.generateQuery(),
        results: profile.length,
        profile: summarizeProfile(profile)
      })

      // Get the car data
      const driveOption = window.driveOption = new Route(profile.filter(function (o) {
        return o.access[0].mode === 'CAR' && (!o.transit || o.transit.length < 1)
      })[0])

      if (driveOption) {
        driveOption.set({
          externalCarpoolMatches: externalMatches,
          hasRideshareMatches: (externalMatches > 0 || ridepoolMatches.length > 0),
          internalCarpoolMatches: {
            matches: ridepoolMatches
          },
          internalCarpoolMatchesCount: ridepoolMatches.length
        })
      }

      // Create a new Route object for each option
      for (let i = 0; i < profile.length; i++) {
        profile[i] = new Route(profile[i])

        if (plan.car() && profile[i].directCar()) {
          profile[i] = driveOption
        }

        profile[i].plan(plan)

        profile[i].setCarData({
          cost: driveOption.cost(),
          emissions: driveOption.emissions(),
          time: driveOption.average()
        })
      }

      // Store the results
      plan.set({
        matches: results.internalMatches,
        options: profile,
        journey: journeys
      })

      log('<-- updated routes')
      done(null, results)
    }
  })
}

function generateErrorMessage (plan, response) {
  var msg = _tr('No results! ')
  var responseText = response ? response.text : ''

  if (responseText.indexOf('VertexNotFoundException') !== -1) {
    msg += _tr('The <strong>')
    msg += responseText.indexOf('[from]') !== -1 ? _tr('from ') : _tr('to ')
    msg += _tr('</strong>address entered is outside the supported region.')
  } else if (!plan.validCoordinates()) {
    msg += plan.coordinateIsValid(plan.from_ll()) ? _tr('To') : _tr('From')
    msg += _tr(' address could not be found. Please enter a valid address.')
  } else if (!plan.bus() || !plan.train()) {
    msg += _tr('Try turning all <strong>transit</strong> modes on.')
  } else if (!plan.bike()) {
    msg += _tr('Add biking to see bike-to-transit results.')
  } else if (!plan.car()) {
    msg += _tr('Unfortunately we were unable to find non-driving results. Try turning on driving.')
  } else if (plan.end_time() - plan.start_time() < 2) {
    msg += _tr('Make sure the hours you specified are large enough to encompass the length of the journey.')
  } else if (plan.days() !== 'M—F') {
    msg += _tr('Transit runs less often on the weekends. Try switching to a weekday.')
  }

  return msg
}

function summarizeProfile (profile) {
  var best = profile[0]
  return {
    allModes: profile.reduce(function (modes, option) {
      var newModes = option.modes.filter(function (m) { return typeof m === 'string' }).join(',')
      if (modes) return modes + ',' + newModes
      else return newModes
    }, ''),
    best: {
      modes: best.modes.join(','),
      time: best.time,
      timeInTransit: best.timeInTransit,
      calories: best.calories,
      cost: best.cost,
      bikeDistance: best.bikeDistance,
      driveDistance: best.driveDistance,
      emissions: best.emissions,
      walkDistance: best.walkDistance
    }
  }
}
