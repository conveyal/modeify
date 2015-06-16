var log = require('./client/log')('geocode');
var get = require('./client/request').get;

/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverse = reverse;
module.exports.suggest = suggest;

/**
 * Geocode
 */

function geocode(address, callback) {
  log('--> geocoding %s', address);
  get('/geocode/' + address, function(err, res) {
    if (err) {
      log('<-- geocoding error %s', err);
      callback(err, res);
    } else {
      log('<-- geocoding complete %j', res.body);
      callback(null, res.body);
    }
  });
}

/**
 * Reverse geocode
 */

function reverse(ll, callback) {
  log('--> reverse geocoding %s', ll);
  get('/geocode/reverse/' + ll[0] + ',' + ll[1], function(err, res) {
    if (err) {
      log('<-- geocoding error %e', err);
      callback(err, res);
    } else {
      log('<-- geocoding complete %j', res.body);
      callback(null, res.body);
    }
  });
}

/**
 * Suggestions!
 */

function suggest(text, callback) {
  var bingSuggestions, nominatimSuggestions, totalSuggestions;
  log('--> getting suggestion for %s', text);
  get('/geocode/suggest/' + text, function(err, res) {
    if (err) {
      log('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      log('<-- got %s suggestions', res.body.length);
	bingSuggestions = res.body;
//      callback(null, res.body);
	get('http://nominatim.openstreetmap.org/search' +
	    '?format=json&addressdetails=1&' +
	    'countrycodes=us&q=' + text, function (err, nRes) {
	    nominatimSuggestions = nRes.body;
	    console.log(nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3)));
	    callback(
		null,
		nominatimSuggestions.slice(0,2).
		    concat(bingSuggestions.slice(0,3))
	    );
	});
    }
  });

}
