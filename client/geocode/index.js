var log = require('./client/log')('geocode');
var get = require('./client/request').get;

var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverse = reverse;
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

    get('https://www.amigocloud.com/api/v1/me/geocoder/autocomplete?text=' + text +'&token=' + config.realtime_access_token(),

        function(err, res) {

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
};
