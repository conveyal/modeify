var config = require('./config')
var express = require('express')
var superagent = require('superagent')

/**
 * Auth Token
 */

var authToken = null
var expires = 0
var expires_in = 20160 // 14 days in minutes

/**
 * Urls
 */

var OAUTH = 'https://www.arcgis.com/sharing/oauth2/token'
var GEOCODE = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'

/**
 * ESRI Query Parameter Defaults
 */

var CATEGORY = 'Address'
var CENTER = config.geocode.center
var DISTANCE = 160 * 1000 // meters
// var FORMAT = 'json'
var OUT_FIELDS = 'StAddr,Nbrhd,City,Subregion,Region,Postal,Country'
// var SOURCE_COUNTRY = 'USA'

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
      console.error(err)
      res.status(400).send(err)
    } else {
      res.status(200).send(addresses[0].coordinate)
    }
  })
})

/**
 * Reverse
 */

router.get('/reverse/:coordinate', function (req, res) {
  reverse(req.params.coordinate, function (err, address) {
    if (err) {
      console.error(err)
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
      console.error(err)
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
  var query = {
    category: CATEGORY,
    f: 'json',
    outFields: OUT_FIELDS,
    sourceCountry: 'USA',
    text: address
  }

  if (address.address) {
    query.text = address.address + ', ' + address.city + ', ' + address.state + ' ' +
      address.zip
  }

  if (address.magic_key) {
    query.magicKey = address.magic_key
  }

  auth(callback, function (token) {
    query.token = token
    superagent
      .get(GEOCODE + '/find')
      .query(query)
      .end(function (err, res) {
        if (err) {
          callback(err, res)
        } else {
          var body = parseResponse(res, callback)
          if (!body || !body.locations || body.locations.length === 0) {
            callback(new Error('Location not found.'))
          } else {
            callback(null, body.locations.map(function (l) {
              var feature = l.feature
              var attr = feature.attributes
              var geometry = feature.geometry
              return {
                address: attr.StAddr,
                city: attr.City,
                county: attr.Subregion,
                state: attr.Region,
                zip: parseInt(attr.Postal, 10),
                country: attr.Country,
                coordinate: {
                  lng: geometry.x,
                  lat: geometry.y
                }
              }
            }))
          }
        }
      })
  })
}

/**
 * Reverse geocode
 */

function reverse (ll, callback) {
  var location = ll
  if (ll.lng) {
    location = ll.lng + ',' + ll.lat
  } else if (ll.x) {
    location = ll.x + ',' + ll.y
  } else if (Array.isArray(ll)) {
    location = ll[0] + ',' + ll[1]
  }

  auth(callback, function (token) {
    superagent
      .get(GEOCODE + '/reverseGeocode')
      .query({
        f: 'json',
        location: location,
        token: token
      })
      .end(function (err, res) {
        if (err) {
          callback(err, res)
        } else {
          var body = parseResponse(res, callback)
          if (!body || !body.address) {
            callback(new Error('Location not found.'))
          } else {
            var addr = body.address
            var coordinate = location.split(',')
            callback(null, {
              address: addr.Address,
              neighborhood: addr.Neighborhood,
              city: addr.City,
              county: addr.Subregion,
              state: addr.Region,
              zip: parseInt(addr.Postal, 10),
              country: addr.CountryCode,
              coordinate: {
                lng: coordinate[0],
                lat: coordinate[1]
              }
            })
          }
        }
      })
  })
}

/**
 * Auto suggest
 */

function suggest (text, callback) {
  auth(callback, function (token) {
    superagent
      .get(GEOCODE + '/suggest')
      .query({
        category: CATEGORY,
        distance: DISTANCE,
        f: 'json',
        location: CENTER,
        sourceCountry: 'USA',
        text: text,
        token: token
      })
      .end(function (err, res) {
        if (err) {
          callback(err, res)
        } else {
          var body = parseResponse(res, callback)
          callback(null, body.suggestions)
        }
      })
  })
}

/**
 * Auth?
 */

function auth (callback, next) {
  generateAuthToken(function (err, token) {
    if (err) {
      callback(err)
    } else {
      next(token)
    }
  })
}

/**
 * Parse
 */

function parseResponse (res, callback) {
  try {
    return JSON.parse(res.text)
  } catch (e) {
    callback(e)
  }
}

/**
 * Generate an auth token
 */

function generateAuthToken (callback) {
  // If we're within 7 days of auth token expiration, generate a new one
  if ((expires - expires_in / 2) < Date.now().valueOf()) {
    superagent
      .get(OAUTH)
      .query({
        client_id: config.arcgis_id,
        client_secret: config.arcgis_secret,
        expiration: expires_in,
        grant_type: 'client_credentials'
      })
      .end(function (err, res) {
        if (err || res.error || !res.ok) {
          callback(err || res.error || res.text)
        } else {
          authToken = res.body.access_token

          // Set the expires time
          expires = new Date()
          expires.setSeconds(expires.getSeconds() + res.body.expires_in)
          expires = expires.valueOf()

          callback(null, authToken)
        }
      })
  } else {
    callback(null, authToken)
  }
}
