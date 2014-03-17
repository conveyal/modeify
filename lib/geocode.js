/**
 * Dependencies
 */

var express = require('express');
var superagent = require('superagent');

/**
 * Url
 */

var url =
  'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';

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

app.get('/:address', function(req, res) {
  encode(req.params.address, function(err, ll) {
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
  var text = '';
  if (address.address) {
    text = address.address + ', ' + address.city + ', ' + address.state + ' ' +
      address.zip;
  } else {
    text = address;
  }

  superagent
    .get(url)
    .query({
      f: 'pjson',
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
            var ll = body.locations[0].feature.geometry;
            callback(null, {
              lng: ll.x,
              lat: ll.y
            });
          }
        }
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
