var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**********tismart **********************/
var dev_amigo_token = "R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN";
var amigocloud_response = {"geocoding":{"version":"0.1","attribution":"https://search.mapzen.com/v1/attribution","query":{"text":"539 Alma St, Palo Alto, California","parsed_text":{"name":"539 Alma St","number":"539","street":"Alma St","state":"CA","regions":["Palo Alto"],"admin_parts":"Palo Alto, California"},"size":10,"private":false},"engine":{"name":"Pelias","author":"Mapzen","version":"1.0"},"timestamp":1458156768182},"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":"5e789adebdc84b9493235fe4efb2d5fa","gid":"oa:address:5e789adebdc84b9493235fe4efb2d5fa","layer":"address","source":"oa","name":"539 Alma Street","housenumber":"539","street":"Alma Street","country_a":"USA","country":"United States","region":"California","region_a":"CA","county":"Santa Clara County","locality":"Palo Alto","neighbourhood":"Downtown","confidence":0.488,"label":"539 Alma Street, Palo Alto, CA"},"geometry":{"type":"Point","coordinates":[-122.162803,37.442859]}}],"bbox":[-122.162803,37.442859,-122.162803,37.442859]};
console.log("amigo cloud response demo");
console.log(amigocloud_response);


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

    bingSuggestions_slice = bingSuggestions.slice(0,3);

    console.log("------------API GEOCODE---------------");
    console.log("res ->", res.body);
    console.log("res.body ->", res);
    console.log("slice ->", bingSuggestions_slice);


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

            console.log("resultado openstrep", nominatimSuggestions);
            nominatimSuggestions_slice = nominatimSuggestions.slice(0,2);
            console.log("parametro enviado",nominatimSuggestions_slice.concat(bingSuggestions_slice));
	    callback(
		null,
            nominatimSuggestions_slice.concat(bingSuggestions_slice);
	    );
	});
    }
  });

}
