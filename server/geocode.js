/**
 * Dependencies
 */

var superagent = require('superagent');

/**
 * Expose `encode`
 */

module.exports.encode = function(address, callback) {
  if (true) return callback(null, [0, 0]);

  superagent
    .get(
      'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find'
  )
    .query({
      text: address,
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
};

/**
 * Expose `reverse`
 */

module.exports.reverse = function(ll, callback) {
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
};
