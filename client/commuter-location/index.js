var Commuter = require('../commuter')
var Location = require('../location')
var log = require('../log')('commuter-location')
var request = require('../request')

module.exports = {
  addCommuters: addCommuters,
  forLocation: forLocation,
  forLocationPaged: forLocationPaged,
  forLocationMiddleware: forLocationMiddleware,
  forCommuter: forCommuter,
  remove: remove,
  sendProfileAndMatches: sendProfileAndMatches,
  coordinatesForLocation: coordinatesForLocation
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
      callback(null, expand(res.body))
    }
  })
}

function forLocationPaged (_location, offset, limit, callback) {
  log('loading commuters for location %s from %s, limit %s', _location, offset, limit)
  request.get('/commuter-locations/', { _location: _location, offset: offset, limit: limit }, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, expand(res.body))
    }
  })
}

function expand (commuterLocations) {
  return (commuterLocations || []).map(function (entry) {
    entry._commuter = new Commuter(entry._commuter)
    entry._location = new Location(entry._location)
    return entry
  })
}

function coordinatesForLocation (_location, callback) {
  log('loading commuter coordinates for location %s', _location)
  request.get('/commuter-locations/coordinates', { _location: _location }, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, res.body)
    }
  })
}

function forCommuter (_commuter, callback) {
  log('loading locations for commuter %s', _commuter)
  request.get('/commuter-locations/', { _commuter: _commuter }, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, (res.body || []).map(function (entry) {
        entry._location = new Location(entry._location)
        return entry
      }))
    }
  })
}

function addCommuters (_location, _organization, commuters, callback) {
  request.post('/commuter-locations', commuters.map(function (c) {
    return {
      _location: _location,
      _organization: _organization,
      _commuter: c
    }
  }), function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, res.text)
    }
  })
}

function remove (_id, callback) {
  request.del('/commuter-locations/' + _id, callback)
}

function sendProfileAndMatches (_id, callback) {
  request.get('/commuter-locations/' + _id + '/send-profile-and-matches', callback)
}
