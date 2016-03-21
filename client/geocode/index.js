var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverse = reverse;
module.exports.suggest = suggest;
module.exports.suggestAmigo = suggestAmigo;
module.exports.reverseAmigo = reverseAmigo;

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

function reverseAmigo(ll, callback) {
  log('--> reverse geocoding %s', ll);

  var parameter = {
      'token':config.realtime_access_token() ,
      'point.lon':ll[0],
      'point.lat':ll[1]
  };
  get('https://www.amigocloud.com/api/v1/me/geocoder/reverse', parameter, function(err, res) {

    if (err) {
      log('<-- geocoding error %e', err);
      //return false;
    } else {
      log('<-- geocoding complete %j', res.body);
      //return res.body;
      callback(false, res.body);
    }
  });
}


/**
 * Suggestions!
 */

function suggestAmigo(text, callback) {

    var list_address;
    var parameter = {
        'token': config.realtime_access_token() ,
        'boundary.rect.min_lat': '36.155617833819',
        'boundary.rect.min_lon': '-123.607177734375',
        'boundary.rect.max_lat': '38.826870521381',
        'boundary.rect.max_lon': '-120.701293945312',
        'sources':'osm,oa',
        'text': text
    };

    get('https://www.amigocloud.com/api/v1/me/geocoder/search', parameter, function(err, res) {

            if(err) {
                log("Amigo Cloud Response Error ->", err);

            }else{
                if(res.body.features) {

                    list_address = res.body.features;
                    if (list_address.length > 0) {
                         callback(
                            null,
                            list_address
                        );
                    }else {
                        callback(true, res);
                    }

                }
            }
    });
}

function suggest(text, callback) {
  var bingSuggestions, nominatimSuggestions, totalSuggestions;
  log('--> getting suggestion for %s', text);

  get('/geocode/suggest/'+ text, function(err, res){

    if (err) {
      log('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      log('<-- got %s suggestions', res.body.length);

	bingSuggestions = res.body;

	get('http://nominatim.openstreetmap.org/search' +
	    '?format=json&addressdetails=1&' +
	    'viewbox=' + southWest[0] + ',' +
	    northEast[1] + ',' + northEast[0] + ',' + southWest[1] +
	    '&bounded=1' +
	    'countrycodes=us&q=' + text, function (err, nRes) {
		var inside = false;
	    nominatimSuggestions = [];
            for (var i = 0; i < nRes.body.length; i++) {
                    nominatimSuggestions.push(nRes.body[i]);
            }
            callback(
		null,
		nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3))
	    );
	});
    }
  });

}