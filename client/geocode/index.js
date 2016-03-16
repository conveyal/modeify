var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**********tismart **********************/
var dev_amigo_token = "R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN";
console.log("imprimir key token actual 2");
console.log(config.realtime_access_token());

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

  get('https://www.amigocloud.com/api/v1/me/geocoder/autocomplete?text=' + text +'&token=' + dev_amigo_token, function(err, res) {

    if(err) {
        console.log("Error amigo cloud");
        console.log(err);
    }else{
        console.log("json amigo cloud response");
        console.log(res);
    }
  });


  get('/geocode/suggest/'+ text, function(err, res){

    if (err) {
      log('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      log('<-- got %s suggestions', res.body.length);

	bingSuggestions = res.body;

    console.log("------------API GEOCODE---------------");
    console.log("res ->", res.body);
    console.log("res.body ->", res);


//      callback(null, res.body);
	get('http://nominatim.openstreetmap.org/search' +
	    '?format=json&addressdetails=1&' +
	    'viewbox=' + southWest[0] + ',' +
	    northEast[1] + ',' + northEast[0] + ',' + southWest[1] +
	    '&bounded=1' +
	    'countrycodes=us&q=' + text, function (err, nRes) {
		var inside = false;
	    nominatimSuggestions = [];
            for (var i = 0; i < nRes.body.length; i++) {
//		inside = inside && (nRes.body[i].lng > southWest[0]);
//		inside = inside && (nRes.body[i].lng < northEast[0]);
//		inside = inside && (nRes.body[i].lat > southWest[1]);
//		inside = inside && (nRes.body[i].lat < northEast[1]);
//		if (inside) {
                    nominatimSuggestions.push(nRes.body[i]);
//		}
            }

            console.log('======data enviada===============');
            console.log(nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3)));
            callback(
		null,
		nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3))
	    );
	});
    }
  });

}
});
