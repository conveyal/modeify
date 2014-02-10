/**
 * Dependencies
 */

var get = require('request').get;

/**
 * Geocode
 */

module.exports = function(address, callback) {
  get('/geocode', address, function(err, res) {
    if (err) {
      callback(err, res);
    } else {
      callback(null, res.body);
    }
  });
};
