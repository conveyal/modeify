var config = require('./config');
var express = require('express');
var superagent = require('superagent');

/**
 * Base ESRI Url
 */

var esri = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Expose `encode` & `reverse`
 */

module.exports.encode = encode;
module.exports.reverse = reverse;

/**
 * Geocode
 */

router.get('/:address', function(req, res) {
  encode(req.params.address, function(err, addresses) {
    if (err) {
      res.send(400, err);
    } else {
      var ll = addresses[0].feature.geometry;
      res.send(200, {
        lng: ll.x,
        lat: ll.y
      });
    }
  });
});

/**
 * Reverse
 */

router.get('/reverse/:coordinate', function(req, res) {
  reverse(req.params.coordinate, function(err, address) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, address);
    }
  });
});

/**
 * Geocode
 */

function encode(address, callback) {
  var text = '';
  if (address.address) {
    text = address.address + ', ' + address.city + ', ' + address.state + ' ' +
      address.zip;
  } else {
    text = address;
  }

  superagent
    .get(esri + '/find')
    .query({
      f: 'json',
      text: text
    })
    .end(function(err, res) {
      if (err) {
        callback(err, res);
      } else {
        var body;
        try {
          body = JSON.parse(res.text);
        } catch (e) {
          callback(e);
        } finally {
          if (!body || !body.locations || body.locations.length === 0) {
            callback(new Error('Location not found.'));
          } else {
            callback(null, body.locations);
          }
        }
      }
    });
}

/**
 * Reverse geocode
 */

function reverse(ll, callback) {
  var location = ll;
  if (ll.lng) {
    location = ll.lng + ',' + ll.lat;
  } else if (ll.x) {
    location = ll.x + ',' + ll.y;
  } else if (ll[0]) {
    location = ll[0] + ',' + ll[1];
  }

  superagent
    .get(esri + '/reverseGeocode')
    .query({
      f: 'json',
      location: location
    })
    .end(function(err, res) {
      if (err) {
        callback(err, res);
      } else {
        var body;
        try {
          body = JSON.parse(res.text);
        } catch (e) {
          callback(e);
        } finally {
          if (!body || !body.address) {
            callback(new Error('Location not found.'));
          } else {
            var addr = body.address;
            callback(null, {
              address: addr.Address,
              neighborhood: addr.Neighborhood,
              city: addr.City,
              county: addr.Subregion,
              state: addr.Region,
              zip: parseInt(addr.Postal, 10),
              country: addr.CountryCode
            });
          }
        }
      }
    });
}
