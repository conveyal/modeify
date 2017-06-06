var Batch = require('batch')
var config = require('../config')
var convert = require('../convert')
var debounce = require('debounce')
var geocode = require('../geocode')
var Journey = require('../journey')
var Location = require('../location')
var log = require('../log')('plan')
var defaults = require('../components/segmentio/model-defaults/0.2.0')
var model = require('component-model')
var ProfileQuery = require('../profile-query')
var ProfileScorer = require('otp-profile-score')
var qs = require('component-querystring')

var loadPlan = require('./load')
var store = require('./store')
var updateRoutes = require('./update-routes')

/**
 * Debounce updates to once every 50ms
 */

var DEBOUNCE_UPDATES = 25
var LIMIT = 2

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    bike: true,
    bikeShare: true,
    bikeSpeed: 8,
    bikeTrafficStress: 4,
    bus: true,
    car: true,
    carParkingCost: 10,
    carCostPerMile: 0.56,
    days: 'M—F',
    end_time: 9,
    from: '',
    from_valid: false,
    loading: true,
    matches: [],
    maxBikeTime: 20,
    maxWalkTime: 15,
    options: [],
    query: new ProfileQuery(),
    scorer: new ProfileScorer(),
    start_time: 7,
    to: '',
    to_valid: false,
    train: true,
    tripsPerYear: 235,
    walk: true,
    walkSpeed: 3
  }))
  .attr('bike')
  .attr('bikeShare')
  .attr('bikeSpeed')
  .attr('bikeTrafficStress')
  .attr('bus')
  .attr('car')
  .attr('carParkingCost')
  .attr('carCostPerMile')
  .attr('days')
  .attr('end_time')
  .attr('from')
  .attr('from_id')
  .attr('from_ll')
  .attr('from_valid')
  .attr('loading')
  .attr('matches')
  .attr('maxBikeTime')
  .attr('maxWalkTime')
  .attr('journey')
  .attr('options')
  .attr('query')
  .attr('scorer')
  .attr('start_time')
  .attr('to')
  .attr('to_id')
  .attr('to_ll')
  .attr('to_valid')
  .attr('train')
  .attr('tripsPerYear')
  .attr('walk')
  .attr('walkSpeed')

/**
 * Expose `load`
 */

module.exports.load = function (userOpts) {
  return loadPlan(Plan, userOpts)
}

/**
 * Sync plans with localStorage
 */

Plan.on('change', function (plan, name, val) {
  log('plan.%s changed to %s', name, val)

  if (name === 'bikeSpeed') {
    plan.scorer().rates.bikeSpeed = convert.mphToMps(val)
  } else if (name === 'walkSpeed') {
    plan.scorer().rates.walkSpeed = convert.mphToMps(val)
  }

  // Store in localStorage & track the change
  if (name !== 'options' && name !== 'journey' && name !== 'loading') plan.store()
})

/**
 * Keep start/end times in sync
 */

Plan.on('change start_time', function (plan, val, prev) {
  if (val >= plan.end_time()) plan.end_time(val + 1)
})

Plan.on('change end_time', function (plan, val, prev) {
  if (val <= plan.start_time()) plan.start_time(val - 1)
})

/**
 * Update routes. Restrict to once every 25ms.
 */

Plan.prototype.updateRoutes = debounce(function (opts, callback) {
  updateRoutes(this, opts, callback)
}, DEBOUNCE_UPDATES)

/**
 * Geocode
 */

Plan.prototype.geocode = function (dest, callback) {
  if (!callback) callback = function () {}

  var plan = this
  var address = plan[dest]()
  var ll = plan[dest + '_ll']()
  if (address && address.length > 0) {
    geocode(address, function (err, ll) {
      if (err) {
        callback(err)
      } else {
        plan[dest + '_ll'](ll)
        callback(null, ll)
      }
    })
  } else {
    callback(null, ll)
  }
}

/**
 * Save Journey
 */

Plan.prototype.saveJourney = function (callback) {
  var opts = {}
  var skipKeys = ['options', 'journey', 'scorer']
  for (var key in this.attrs) {
    if (skipKeys.indexOf(key) !== -1 || key.indexOf('to') === 0 || key.indexOf('from') === 0) {
      continue
    }
    opts[key] = this.attrs[key]
  }

  // Create new journey
  var journey = new Journey({
    locations: [{
      _id: this.from_id()
    }, {
      _id: this.to_id()
    }],
    opts: opts
  })

  // Save
  journey.save(callback)
}

/**
 * Valid coordinates
 */

Plan.prototype.validCoordinates = function () {
  return this.coordinateIsValid(this.from_ll()) && this.coordinateIsValid(this.to_ll())
}

/**
 * Set Address
 */

Plan.prototype.setAddress = function (name, address, callback) {
  callback = callback || function () {} // noop callback
  if (!address || address.length < 1) return callback()

  var location = new Location()
  var plan = this
  var c = address.split(',')
  var isCoordinate = c.length === 2 && !isNaN(parseFloat(c[0])) && !isNaN(parseFloat(c[1]))

  if (isCoordinate) {
    location.coordinate({
      lat: parseFloat(c[1]),
      lng: parseFloat(c[0])
    })
  } else {
    location.address(address)
  }

  location.save(function (err, res) {
    if (err) {
      callback(err)
    } else {
      var changes = {}
      if (isCoordinate) {
        changes[name] = res.body.address
        if (res.body.city) changes[name] += ', ' + res.body.city
        if (res.body.state) changes[name] += ', ' + res.body.state
      } else {
        changes[name] = address
      }

      changes[name + '_ll'] = res.body.coordinate
      changes[name + '_id'] = res.body._id
      changes[name + '_valid'] = true

      plan.set(changes)
      callback(null, res.body)
    }
  })
}

/**
 * Set both addresses
 */

Plan.prototype.setAddresses = function (from, to, callback) {
  // Initialize the default locations
  var plan = this

  Batch()
    .push(function (done) {
      plan.setAddress('from', from, done)
    })
    .push(function (done) {
      plan.setAddress('to', to, done)
    }).end(callback)
}

/**
 * Rescore Options
 */

Plan.prototype.rescoreOptions = function () {
  var scorer = this.scorer()
  var options = this.options()

  options.forEach(function (o) {
    o.rescore(scorer)
  })

  this.store()
}

Plan.prototype.coordinateIsValid = function (c) {
  return !!c && !!parseFloat(c.lat) && !!parseFloat(c.lng)
}

/**
 * Modes as a CSV
 */

Plan.prototype.modesCSV = function () {
  var modes = []
  if (this.bike()) modes.push('BICYCLE')
  if (this.bikeShare()) modes.push('BICYCLE_RENT')
  if (this.bus()) modes.push('BUS')
  if (this.train()) modes.push('RAIL,SUBWAY,TRAM') //TL 06/06/2017 Trainish n'existe plus
  if (this.walk()) modes.push('WALK')
  if (this.car()) modes.push('CAR')

  return modes.join(',')
}

/**
 * Set modes from string
 */

Plan.prototype.setModes = function (csv) {
  if (!csv || csv.length < 1) return
  var modes = csv.split ? csv.split(',') : csv

  this.bike(modes.indexOf('BICYCLE') !== -1)
  this.bikeShare(modes.indexOf('BICYCLE_RENT') !== -1)
  this.bus(modes.indexOf('BUS') !== -1)
  this.train(modes.indexOf('RAIL') !== -1)
  this.train(modes.indexOf('TRAM') !== -1)
  this.train(modes.indexOf('SUBWAY') !== -1)
  this.car(modes.indexOf('CAR') !== -1)
}

/**
 * Generate Query Parameters for this plan
 */

Plan.prototype.generateQuery = function () {
  var from = this.from_ll() || {}
  var to = this.to_ll() || {}

  // Transit modes
  var accessModes = ['WALK']
  var directModes = [] // ['CAR', 'WALK']
  var egressModes = ['WALK']
  var transitModes = []

  if (this.walk()) {
    directModes.push('WALK')
  }
  if (this.bike()) {
    accessModes.push('BICYCLE')
    directModes.push('BICYCLE')
  }
  if (this.bikeShare()) {
    accessModes.push('BICYCLE_RENT')
    directModes.push('BICYCLE_RENT')
    egressModes.push('BICYCLE_RENT')
  }
  if (this.bus()) transitModes.push('BUS')
  if (this.car()) {
    accessModes.push('CAR_PARK')
    directModes.push('CAR')
  }
  if (this.train()) transitModes.push('RAIL,SUBWAY,TRAM')//TL 06/06/2017 Trainish n'existe plus

  var startTime = this.start_time()
  var endTime = this.end_time()

  // Convert the hours into strings
  startTime += ':00'
  endTime = endTime === 24 ? '23:59' : endTime + ':00'

  return {
    accessModes: accessModes.join(','),
    bikeSafe: 1000,
    bikeSpeed: convert.mphToMps(this.bikeSpeed()),
    bikeTrafficStress: this.bikeTrafficStress(),
    date: this.nextDate(),
    directModes: directModes.join(','),
    egressModes: egressModes.join(','),
    endTime: endTime,
    from: {
      lat: from.lat,
      lon: from.lng,
      name: this.from()
    },
    maxBikeTime: this.maxBikeTime(),
    maxWalkTime: this.maxWalkTime(),
    maxCarTime: 45,
    startTime: startTime,
    to: {
      lat: to.lat,
      lon: to.lng,
      name: this.to()
    },
    limit: LIMIT,
    transitModes: transitModes.join(','),
    walkSpeed: convert.mphToMps(this.walkSpeed())
  }
}

Plan.prototype.generateOtpQuery = function () {
  var query = this.generateQuery()
  query.from = query.from.lat + ',' + query.from.lon
  query.to = query.to.lat + ',' + query.to.lon
  return query
}

Plan.prototype.generateURL = function () {
  return config.base_url() + config.api_url() + '/plan?' + decodeURIComponent(qs.stringify(this.generateOtpQuery()))
}

/**
 * Store in localStorage. Restrict this I/O to once every 25ms.
 */

Plan.prototype.store = debounce(function () {
  store(this)
}, DEBOUNCE_UPDATES)

/**
 * Clear localStorage
 */

Plan.prototype.clearStore = store.clear

/**
 * Save URL
 */

Plan.prototype.saveURL = function () {
  window.history.replaceState(null, '', '/planner?' + this.generateQueryString())
}

/**
 * Get next date for day of the week
 */

Plan.prototype.nextDate = function () {
  var now = new Date()
  var date = now.getDate()
  var dayOfTheWeek = now.getDay()
  switch (this.days()) {
    case 'M—F':
      if (dayOfTheWeek === 0) now.setDate(date + 1)
      if (dayOfTheWeek === 6) now.setDate(date + 2)
      break
    case 'Sat':
      now.setDate(date + (6 - dayOfTheWeek))
      break
    case 'Sun':
      now.setDate(date + (7 - dayOfTheWeek))
      break
  }
  return now.toISOString().split('T')[0]
}

/**
 * Generate `places` for transitive
 */

Plan.prototype.generatePlaces = function () {
  var fll = this.from_ll()
  var tll = this.to_ll()
  var places = []

  if (fll) {
    places.push({
      place_id: 'from',
      place_lat: fll.lat,
      place_lon: fll.lng,
      place_name: 'From'
    })
  }

  if (tll) {
    places.push({
      place_id: 'to',
      place_lat: tll.lat,
      place_lon: tll.lng,
      place_name: 'To'
    })
  }

  return places
}

/**
 * Generate QueryString
 */

Plan.prototype.generateQueryString = function () {
  return qs.stringify({
    from: this.from(),
    to: this.to(),
    modes: this.modesCSV(),
    start_time: this.start_time(),
    end_time: this.end_time(),
    days: this.days()
  })
}

/**
 * Clear
 */

Plan.prototype.clear = function () {
  this.set({
    options: [],
    journey: {
      places: this.generatePlaces()
    }
  })
}
