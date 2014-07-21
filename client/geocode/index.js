var config = require('config');
var debug = require('debug')(config.name() + ':geocode');
var jsonp = require('jsonp');
var get = require('request').get;

/**
 * Geocode
 */

module.exports = geocode;
module.exports.suggest = suggest;

/**
 * Geocode
 */

function geocode(address, callback) {
  debug('--> geocoding %s', address);
  get('/geocode/' + address, function(err, res) {
    if (err) {
      debug('<-- geocoding error %s', err);
      callback(err, res);
    } else {
      debug('<-- geocoding complete %j', res.body);
      callback(null, res.body);
    }
  });
}

/**
 * Suggestions!
 */

function suggest(text, callback) {
  debug('--> getting suggestion for %s', text);
  get('/geocode/suggest/' + text, function(err, res) {
    if (err) {
      debug('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      debug('<-- got %s suggestions', res.body.length);
      callback(null, res.body);
    }
  });
}

/**
 * From IP Address
 */

module.exports.fromIp = function(callback) {
  debug('--> geocode from current IP address');
  jsonp('ipinfo.io', function(err, data) {
    if (err) {
      debug('<-- geocoding error %s', err);
      callback(err, data);
    } else {
      debug('<-- geocoding complete %j', data);
      var ll = data.loc.split(',');
      callback(null, {
        lat: ll[0],
        lng: ll[1]
      });
    }
  });
};
