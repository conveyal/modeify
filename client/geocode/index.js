var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**********tismart **********************/
var dev_amigo_token = "R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN";
var response_autocomplete_amigo = {"geocoding":{"version":"0.1","attribution":"https://search.mapzen.com/v1/attribution","query":{"text":"palo","size":10,"private":false},"engine":{"name":"Pelias","author":"Mapzen","version":"1.0"},"timestamp":1458140587715},"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":"1633037","gid":"gn:locality:1633037","layer":"locality","source":"gn","name":"Palopo","country_a":"IDN","country":"Indonesia","region":"South Sulawesi","locality":"Palopo","confidence":0.893,"label":"Palopo, South Sulawesi, Indonesia"},"geometry":{"type":"Point","coordinates":[120.19694,-2.9925]}},{"type":"Feature","properties":{"id":"1260667","gid":"gn:locality:1260667","layer":"locality","source":"gn","name":"P\u0101loncha","country_a":"IND","country":"India","region":"Telangana","locality":"P\u00c4\u0081loncha","confidence":0.886,"label":"P\u0101loncha, P\u00c4\u0081loncha, India"},"geometry":{"type":"Point","coordinates":[80.70509,17.60184]}},{"type":"Feature","properties":{"id":"1696018","gid":"gn:neighbourhood:1696018","layer":"neighbourhood","source":"gn","name":"Palompon","country_a":"PHL","country":"Philippines","region":"Eastern Visayas","county":"Province of Leyte","confidence":0.882,"label":"Palompon, Province of Leyte, Philippines"},"geometry":{"type":"Point","coordinates":[124.41667,11.03333]}},{"type":"Feature","properties":{"id":"1696043","gid":"gn:neighbourhood:1696043","layer":"neighbourhood","source":"gn","name":"Palo","country_a":"PHL","country":"Philippines","region":"Eastern Visayas","county":"Province of Leyte","confidence":0.941,"label":"Palo, Province of Leyte, Philippines"},"geometry":{"type":"Point","coordinates":[124.96667,11.13333]}},{"type":"Feature","properties":{"id":"6322903","gid":"gn:county:6322903","layer":"county","source":"gn","name":"Palotina","country_a":"BRA","country":"Brazil","region":"Paran\u00e1","county":"Palotina","confidence":0.674,"label":"Palotina, Paran\u00e1, Brazil"},"geometry":{"type":"Point","coordinates":[-53.77055,-24.21953]}},{"type":"Feature","properties":{"id":"9843582","gid":"gn:county:9843582","layer":"county","source":"gn","name":"Kota Palopo","country_a":"IDN","country":"Indonesia","region":"South Sulawesi","county":"KOTA PALOPO","confidence":0.668,"label":"Kota Palopo, KOTA PALOPO, Indonesia"},"geometry":{"type":"Point","coordinates":[120.11078,-2.97841]}},{"type":"Feature","properties":{"id":"3630932","gid":"gn:locality:3630932","layer":"locality","source":"gn","name":"Palo Negro","country_a":"VEN","country":"Venezuela","region":"Aragua","county":"Municipio Libertador","confidence":0.666,"label":"Palo Negro, Municipio Libertador, Venezuela"},"geometry":{"type":"Point","coordinates":[-67.54194,10.17389]}},{"type":"Feature","properties":{"id":"9609537","gid":"gn:county:9609537","layer":"county","source":"gn","name":"Palocabildo","country_a":"COL","country":"Colombia","region":"Tolima","confidence":0.661,"label":"Palocabildo, Tolima, Colombia"},"geometry":{"type":"Point","coordinates":[-75.01842,5.09423]}},{"type":"Feature","properties":{"id":"3110876","gid":"gn:neighbourhood:3110876","layer":"neighbourhood","source":"gn","name":"Sant Andreu de Palomar","country_a":"ESP","country":"Spain","region":"Catalonia","county":"Prov\u00edncia de Barcelona","localadmin":"Barcelona","locality":"Barcelona","confidence":0.658,"label":"Sant Andreu de Palomar, Barcelona, Spain"},"geometry":{"type":"Point","coordinates":[2.18982,41.43541]}},{"type":"Feature","properties":{"id":"5380748","gid":"gn:locality:5380748","layer":"locality","source":"gn","name":"Palo Alto","country_a":"USA","country":"United States","region":"California","region_a":"CA","county":"Santa Clara County","locality":"Palo Alto","confidence":0.657,"label":"Palo Alto, Santa Clara County, CA"},"geometry":{"type":"Point","coordinates":[-122.14302,37.44188]}}],"bbox":[-122.14302,-24.21953,124.96667,41.43541]};
console.log("Amigo cloud response api autocomplete");
console.log(response_autocomplete_amigo);

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

    var lista_direcciones = response_autocomplete_amigo.features;
    if (lista_direcciones.length > 0) {
         callback(
		    null,
		    lista_direcciones
	    );
    }
}

function suggestOld(text, callback) {
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

