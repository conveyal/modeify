var Commuter = require('commuter')
var Location = require('location')
var log = require('log')('commuter-location')
var request = require('request')

module.exports = {
  addCommuters: addCommuters,
  forLocation: forLocation,
  forLocationMiddleware: forLocationMiddleware,
  forCommuter: forCommuter,
  remove: remove,
  sendProfileAndMatches: sendProfileAndMatches
}

function forLocationMiddleware (ctx, next) {
  if (!ctx.location || ctx.location === 'new') return next()
  forLocation(ctx.location._id(), function (err, commuterLocations) {
    if (err) {
      next(err)
    } else {
      ctx.commuterLocations = commuterLocations || []
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
        entry._commuter = new Commuter(entry._commuter)
        entry._location = new Location(entry._location)
        return entry
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

function remove (_id, callback) {
  request.del('/commuter-locations/' + _id, callback)
}

function sendProfileAndMatches (_id, callback) {
  request.get('/commuter-locations/' + _id + '/send-profile-and-matches', callback)
}
