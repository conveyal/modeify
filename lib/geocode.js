const lonlat = require('@conveyal/lonlat')
const express = require('express')
const GeocoderArcGIS = require('geocoder-arcgis')

const config = require('./config')

const geocoder = new GeocoderArcGIS(config.arcgis)

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

  const options = {
    forStorage: true,
    outFields: '*'
  }

  if (config.geocode.center) {
    options.location = config.geocode.center
  }

  if (config.geocode.searchExtent) {
    options.searchExtent = config.geocode.searchExtent
  }

  geocoder.findAddressCandidates(address, options)
    .then(response => {
      if (!response.candidates || response.candidates.length === 0) {
        callback('Address not found.')
      } else {
        callback(null, response)
      }
    })
    .catch(callback)
}

/**
 * Reverse geocode
 */

function reverse (ll, callback) {
  geocoder.reverse(lonlat.toString(ll), { forStorage: true })
    .then(result => {
      if (!result.address) {
        callback('Coordinates not found.')
      } else {
        callback(null, {
          address: result.address.LongLabel,
          city: result.address.City,
          state: result.address.Region,
          zip: result.address.Postal,
          country: result.address.CountryCode,
          coordinate: {
            lat: result.location.y,
            lng: result.location.x
          }
        })
      }
    })
    .catch(callback)
}

/**
 * Auto suggest
 */

function suggest (text, callback) {
  const options = {
    forStorage: true
  }

  if (config.geocode.center) {
    options.location = config.geocode.center
  }

  if (config.geocode.searchExtent) {
    options.searchExtent = config.geocode.searchExtent
  }

  geocoder.suggest(text, options)
    .then(result => {
      if (!result.suggestions) {
        return callback(null, [])
      }
      callback(null, result.suggestions)
    })
    .catch(callback)
}
