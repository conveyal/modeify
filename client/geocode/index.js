var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**********tismart **********************/
var dev_amigo_token = "A:m8SOB7KwYWuuWAeYEHHjBf7U9VIZFrMuH2LLjS";
var url_search_amigo = "https://www.amigocloud.com/api/v1/me/geocoder/search";
var data_boundary = {
    "min_lat" : 36.155617833819,
    "min_lon" : -123.607177734375,
    "max_lat" : 38.826870521381,
    "max_lon" : -120.701293945312
};


console.log("data_boundary ->", data_boundary.min_lat);
/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverse = reverse;
module.exports.suggest = suggest;
module.exports.suggestAmigo = suggestAmigo;

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

  console.log("reserve ll", ll);
  console.log("reserve callback", callback);
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


function suggestAmigo(text, callback) {

    var lista_direcciones;

    //get('https://www.amigocloud.com/api/v1/me/geocoder/autocomplete?text=' + text +'&token=' + dev_amigo_token,
    //get(url_search_amigo + '?token='+config.realtime_access_token()+'&boundary.rect.min_lat='+data_boundary.min_lat+'&boundary.rect.min_lon='+data_boundary.min_lon+'&boundary.rect.max_lat='+data_boundary.max_lat+'&boundary.rect.max_lon='+data_boundary.max_lon+'&sources=osm,oa&text=' + text,

    get('https://www.amigocloud.com/api/v1/me/geocoder/search?token='+config.realtime_access_token()+'&boundary.rect.min_lat=36.155617833819&boundary.rect.min_lon=-123.607177734375&boundary.rect.max_lat=38.826870521381&boundary.rect.max_lon=-120.701293945312&sources=osm,oa&text=' + text,
        function(err, res) {

            console.log("llama al resultado ==>",res);

            if(err) {
                console.log("Error amigo cloud");
                log("Amigo Cloud Response Error ->", err);

            }else{
                if(res.body.features) {

                    var lista_direcciones = res.body.features;
                    if (lista_direcciones.length > 0) {
                         callback(
                            null,
                            lista_direcciones
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