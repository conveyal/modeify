var config = require('./config');
var express = require('express');
var superagent = require('superagent');

/**
 * Auth Token
 */

var authToken = null;
var expires = 0;
var expires_in = 20160; // 14 days in minutes

/**
 * Urls
 */

var oauth = 'https://www.arcgis.com/sharing/oauth2/token';
var geocode = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';

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
      console.error(err);
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
      console.error(err);
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

  generateAuthToken(function(err, token) {
    if (err) {
      callback(err);
    } else {
      superagent
        .get(geocode + '/find')
        .query({
          f: 'json',
          text: text,
          token: token
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

  generateAuthToken(function(err, token) {
    if (err) {
      callback(err);
    } else {
      superagent
        .get(geocode + '/reverseGeocode')
        .query({
          f: 'json',
          location: location,
          token: token
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
  });
}

/**
 * Generate an auth token
 */

function generateAuthToken(callback) {
  // If we're within 7 days of auth token expiration, generate a new one
  if ((expires - expires_in / 2) < Date.now().valueOf()) {
    superagent
      .get(oauth)
      .query({
        client_id: config.arcgis_id,
        client_secret: config.arcgis_secret,
        expiration: expires_in,
        grant_type: 'client_credentials'
      })
      .end(function(err, res) {
        if (err || res.error || !res.ok) {
          callback(err || res.error || res.text);
        } else {
          authToken = res.body.access_token;

          // Set the expires time
          expires = new Date();
          expires.setSeconds(expires.getSeconds() + res.body.expires_in);
          expires = expires.valueOf();

          callback(null, authToken);
        }
      });
  } else {
    callback(null, authToken);
  }
}
