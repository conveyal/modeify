/**
 * Dependencies
 */

var express = require('express');
var superagent = require('superagent');

/**
 * Url
 */

var url = 'http://cherriots.dev.conveyal.com/simplecoder';

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Expose `encode` & `reverse`
 */

module.exports.encode = encode;
module.exports.reverse = reverse;

/**
 * Geocode
 */

app.get('/', function(req, res) {
  encode(req.query, function(err, ll) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, ll);
    }
  });
});

/**
 * Reverse
 */

app.get('/reverse', function(req, res) {
  reverse(req.query, function(err, address) {
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
  superagent
    .get(url + '/q/' + address.address + '/' + address.city + ', ' + address.state +
      ' ' + address.zip)
    .end(function(err, res) {
      if (err) {
        callback(err, res);
      } else if (!res.body || res.body.length === 0) {
        callback(null, {});
      } else {
        var ll = res.body[0];
        callback(null, {
          lng: ll.lon,
          lat: ll.lat
        });
      }
    });
}

/**
 * Reverse geocode
 */

function reverse(ll, callback) {
  superagent
    .get(
      'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find'
  )
    .query({
      text: ll,
      f: 'json'
    })
    .end(function(err, res) {
      if (err) {
        callback(err, res);
      } else if (!res.body || !res.body.locations || res.body.locations.length ===
        0) {
        callback(new Error('Location not found.'));
      } else {
        var ll = res.body.locations[0].feature.geometry;
        callback(null, [ll.x, ll.y]);
      }
    });
}
