var express = require('express')
var Mapbox = require('mapbox/lib/services/geocoder')

var config = require('./config')

var mapbox = new Mapbox(config.mapbox_access_token)
var center = config.geocode.center.split(',').map(parseFloat)
var proximity = {
  latitude: center[1],
  longitude: center[0]
}

/**
 * Expose `router`
 */

var router = module.exports = express.Router()

/**
 * Expose `encode` & `reverse`
 */

module.exports.encode = encode
module.exports.reverse = reverse
module.exports.suggest = suggest

/**
 * Geocode
 */

router.get('/:address', function (req, res) {
  encode(req.params.address, function (err, addresses) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(addresses[0].coordinate)
    }
  })
})

/**
 * Geocode
 */

router.get('/extended/:address', function (req, res) {
  encode(req.params.address, function (err, addresses) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(addresses[0])
    }
  })
})

/**
 * Reverse
 */

router.get('/reverse/:coordinate', function (req, res) {
  reverse(req.params.coordinate, function (err, address) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(address)
    }
  })
})

/**
 * Suggest
 */

router.get('/suggest/:text', function (req, res) {
  suggest(req.params.text, function (err, suggestions) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(suggestions)
    }
  })
})

/**
 * Geocode
 */

function encode (address, callback) {
  if (address.address) {
    address = address.address + ', ' + address.city + ', ' + address.state + ' ' +
      address.zip
  }

  mapbox.geocodeForward(address, { proximity }, (err, response) => {
    if (err) {
      callback(err)
    } else {
      callback(null, response.features.map((f) => {
        const context = splitContext(f.context)
        context.address = f.place_name
        context.coordinate = {
          lat: f.center[1],
          lng: f.center[0]
        }
        return context
      }))
    }
  })
}

/**
 * Reverse geocode
 */

function reverse (ll, callback) {
  var location = ll
  if (typeof ll === 'string') {
    ll = ll.split(',')
  }

  if (ll.lng || ll.lon) {
    location = {
      longitude: ll.lng || ll.lon,
      latitude: ll.lat
    }
  } else if (ll.x) {
    location = {
      longitude: ll.x,
      latitude: ll.y
    }
  } else if (Array.isArray(ll)) {
    location = {
      longitude: ll[0],
      latitude: ll[1]
    }
  }

  mapbox.geocodeReverse(location, (err, results) => {
    if (err) {
      console.error(err)
      callback(err)
    } else {
      console.log(JSON.stringify(results, null, '\t'))
      const feature = results.features[0]
      const context = splitContext(feature.context)
      context.address = feature.place_name
      context.coordinate = {
        lat: feature.center[1],
        lng: feature.center[0]
      }

      callback(null, context)
    }
  })
}

/**
 * Auto suggest
 */

function suggest (text, callback) {
  mapbox.geocodeForward(text, { proximity }, (err, response) => {
    if (err) {
      callback(err, response)
    } else {
      callback(null, response.features.map(r => {
        return {
          id: r.id,
          text: r.place_name,
          center: r.center
        }
      }))
    }
  })
}

function splitContext (ctx) {
  return {
    city: findType(ctx, 'place'),
    state: findType(ctx, 'region'),
    zip: parseInt(findType(ctx, 'postcode'), 10),
    country: findType(ctx, 'country')
  }
}

function findType (ctx, type) {
  const found = ctx.filter(c => c.id.indexOf(type) !== -1)[0]
  if (found) {
    return found.text
  }
}
