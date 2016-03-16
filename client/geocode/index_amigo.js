var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**********tismart **********************/
var dev_amigo_token = "R:3jqO9zmsFuFpdn0BosPJbXpjf82PISOJXqMbwN";
var response_autocomplete_amigo = {"geocoding":{"version":"0.1","attribution":"https://search.mapzen.com/v1/attribution","query":{"text":"Palo alto","size":10,"private":false},"engine":{"name":"Pelias","author":"Mapzen","version":"1.0"},"timestamp":1458164228869},"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":"5380748","gid":"gn:locality:5380748","layer":"locality","source":"gn","name":"Palo Alto","country_a":"USA","country":"United States","region":"California","region_a":"CA","county":"Santa Clara County","locality":"Palo Alto","confidence":0.956,"label":"Palo Alto, Santa Clara County, CA"},"geometry":{"type":"Point","coordinates":[-122.14302,37.44188]}},{"type":"Feature","properties":{"id":"5345032","gid":"gn:locality:5345032","layer":"locality","source":"gn","name":"East Palo Alto","country_a":"USA","country":"United States","region":"California","region_a":"CA","county":"San Mateo County","locality":"East Palo Alto","confidence":0.889,"label":"East Palo Alto, San Mateo County, CA"},"geometry":{"type":"Point","coordinates":[-122.14108,37.46883]}},{"type":"Feature","properties":{"id":"4870630","gid":"gn:county:4870630","layer":"county","source":"gn","name":"Palo Alto County","country_a":"USA","country":"United States","region":"Iowa","region_a":"IA","county":"Palo Alto County","confidence":0.882,"label":"Palo Alto County, IA"},"geometry":{"type":"Point","coordinates":[-94.67814,43.08206]}},{"type":"Feature","properties":{"id":"3993763","gid":"gn:locality:3993763","layer":"locality","source":"gn","name":"Palo Alto","country_a":"MEX","country":"Mexico","region":"Aguascalientes","county":"El Llano","locality":"Palo Alto","confidence":0.94,"label":"Palo Alto, El Llano, Mexico"},"geometry":{"type":"Point","coordinates":[-101.96542,21.91837]}},{"type":"Feature","properties":{"id":"5204971","gid":"gn:locality:5204971","layer":"locality","source":"gn","name":"Palo Alto","country_a":"USA","country":"United States","region":"Pennsylvania","region_a":"PA","county":"Schuylkill County","localadmin":"Palo Alto","locality":"Palo Alto","confidence":0.731,"label":"Palo Alto, Schuylkill County, PA"},"geometry":{"type":"Point","coordinates":[-76.17216,40.68731]}},{"type":"Feature","properties":{"id":"5204972","gid":"gn:neighbourhood:5204972","layer":"neighbourhood","source":"gn","name":"Borough of Palo Alto","country_a":"USA","country":"United States","region":"Pennsylvania","region_a":"PA","county":"Schuylkill County","localadmin":"Palo Alto","locality":"Palo Alto","confidence":0.669,"label":"Borough of Palo Alto, Palo Alto, PA"},"geometry":{"type":"Point","coordinates":[-76.16993,40.68609]}},{"type":"Feature","properties":{"id":"8863761","gid":"gn:locality:8863761","layer":"locality","source":"gn","name":"Palos Altos","country_a":"MEX","country":"Mexico","region":"Guanajuato","county":"San Luis de la Paz","confidence":0.667,"label":"Palos Altos, San Luis de la Paz, Mexico"},"geometry":{"type":"Point","coordinates":[-100.58306,21.185]}},{"type":"Feature","properties":{"id":"2050:locality:us:usa:palo_alto","gid":"qs:locality:2050:locality:us:usa:palo_alto","layer":"locality","source":"qs","name":"Palo Alto","country_a":"USA","country":"United States","region":"California","region_a":"CA","county":"Santa Clara County","confidence":0.722,"label":"Palo Alto, Santa Clara County, CA"},"geometry":{"type":"Point","coordinates":[-122.142952454154,37.3960207555935]}},{"type":"Feature","properties":{"id":"8885323","gid":"gn:locality:8885323","layer":"locality","source":"gn","name":"Palos Altos (Palos Altos Dos)","country_a":"MEX","country":"Mexico","region":"Guerrero","county":"San Miguel Totolapan","confidence":0.653,"label":"Palos Altos (Palos Altos Dos), San Miguel Totolapan, Mexico"},"geometry":{"type":"Point","coordinates":[-100.3906,18.17502]}}],"bbox":[-122.14302,18.17502,-76.16993,43.08206]};
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

/** suggesstions amigo
**/

function suggest_amigo(text, callback) {
    var lista_direcciones = response_autocomplete_amigo.features;
    if (lista_direcciones.length > 0) {
         callback(
		null,
		dato aqui
	    );
    }
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
            console.log(nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3));
	    callback(
		null,
		nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3))
	    );
	});
    }
  });

}
