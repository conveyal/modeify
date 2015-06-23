var Commuter = require('commuter')
var Location = require('location')
var log = require('log')('commuter-location')
var request = require('request')

module.exports = {
  addCommuters: addCommuters,
  forLocation: forLocation,
  forLocationMiddleware: forLocationMiddleware,
  forCommuter: forCommuter
}

function forLocationMiddleware (ctx, next) {
  if (!ctx.location || ctx.location === 'new') return next()
  forLocation(ctx.location._id(), function (err, res) {
    if (err) {
      next(err)
    } else {
      ctx.commuters = res.body || []
      next()
    }
  })
}

function forLocation (_location, callback) {
  log('loading commuters for location %s', _location)
  request.get('/commuter-locations/', { _location: _location }, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, (res.body || []).map(function (entry) {
        return {
          commuter: new Commuter(entry._commuter),
          matches: entry.matches,
          profile: entry.profile
        }
      }))
    }
  })
}

function forCommuter (_commuter, callback) {
  request.get('/commuter-locations/', { _commuter: _commuter }, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, (res.body || []).map(function (entry) {
        return {
          location: new Location(entry._location),
          matches: entry.matches,
          profile: entry.profile
        }
      }))
    }
  })
}

function addCommuters (_location, commuters, callback) {
  request.post('/commuter-locations', commuters.map(function (c) {
    return {
      _location: _location,
      _commuter: c
    }
  }), function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, res.body)
    }
  })
}
