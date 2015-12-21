import express from 'express'
import superagent from 'superagent'

import config from './config'

var center = config.geocode.center.split(',').map(parseFloat)
var proximity = {
  latitude: center[1],
  longitude: center[0]
}
const api_key = config.mapzen.search.api_key
const mapzenUrl = 'https://search.mapzen.com/v1'

const reverseUrl = `${mapzenUrl}/reverse`
const searchUrl = `${mapzenUrl}/search`

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

  superagent
    .get(searchUrl)
    .query({
      api_key,
      'boundary.country': 'USA',
      'focus.point.lat': proximity.latitude,
      'focus.point.lon': proximity.longitude,
      text: address
    })
    .end((err, response) => {
      if (err) {
        callback(err, response)
      } else if (!response.body.features || response.body.features.length < 1) {
        callback('Address not found.')
      } else {
        callback(null, response.body.features.map(splitFeature))
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

  superagent
    .get(reverseUrl)
    .query({
      api_key,
      'boundary.country': 'USA',
      'point.lat': location.latitude,
      'point.lon': location.longitude
    })
    .end((err, response) => {
      if (err) {
        callback(err)
      } else if (!response.body.features || response.body.features.length < 1) {
        callback('Coordinates not found.')
      } else {
        callback(null, splitFeature(response.body.features[0]))
      }
    })
}

/**
 * Auto suggest
 */

function suggest (text, callback) {
  superagent
    .get(searchUrl)
    .query({
      api_key,
      'boundary.country': 'USA',
      'focus.point.lat': proximity.latitude,
      'focus.point.lon': proximity.longitude,
      text
    })
    .end((err, response) => {
      if (err) {
        callback(err, response)
      } else {
        callback(null, response.body.features.map(f => {
          return {
            id: f.properties.id,
            text: f.properties.label,
            center: f.geometry.coordinates
          }
        }))
      }
    })
}

function splitFeature ({geometry, properties}) {
  return {
    address: properties.label,
    city: properties.locality,
    state: properties.region,
    zip: properties.postalcode ? parseInt(properties.postalcode, 10) : undefined,
    country: properties.country,
    coordinate: {
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0]
    }
  }
}
