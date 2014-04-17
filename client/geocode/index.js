var config = require('config');
var debug = require('debug')(config.name() + ':geocode');
var get = require('request').get;

/**
 * Geocode
 */

module.exports = function(address, callback) {
  debug('--> geocoding %s', address);
  get('/geocode/' + address, function(err, res) {
    if (err) {
      debug('<-- geocoding error %s', err);
      callback(err, res);
    } else {
      debug('<-- geocoding complete %s', res.body);
      callback(null, res.body);
    }
  });
};
