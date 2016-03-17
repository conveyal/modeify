var config = require('./config');
var log = require('./log');
var superagent = require('superagent');

/**
 * Urls
 */

var GEOCODE = 'http://vta2.amigocloud.com/api/otp/binggeocode';
var southWest = [-123.099060058594, 36.745486924699];
var northEast = [-121.192932128906, 38.182068998322];

/**
 * Expose `encode` & `reverse`
 */

module.exports = {};

module.exports.encode = encode;
module.exports.reverse = reverse;
module.exports.suggest = suggest;

/**
 * Geocode
 */

function encode(address, callback) {
  var query = {
      address: address,
      key: config.bing_key
  };

  console.log("Query excecute opt -> ", query);

  if (address.address) {
    query.address = address.address + ', ' + address.city + ', ' + address.state + ' ' +
      address.zip;
  }

  superagent
    .get(GEOCODE)
    .query(query)
    .end(function(err, res) {
      if (err) {
        callback(err, res);
      } else {
        var body = parseResponse(res, callback);
        if (!body || !body.results || body.results.length === 0) {
          callback(new Error('Location not found.'));
        } else {
          callback(null, body.results.map(function(l) {

            return {
              address: l.description,
              coordinate: {
                lng: l.lng,
                lat: l.lat
                }
            };
          }));
        }
      }
    });
}

/**
 * Reverse geocode
 */

function reverse(ll, callback) {
  var location = ll;
  if (ll.lng) {
    location = ll.lng + ',' + ll.lat;
  } else if (ll.x) {
    location = ll.x + ',' + ll.y;
  } else if (Array.isArray(ll)) {
    location = ll[0] + ',' + ll[1];
  }

/*  auth(callback, function(token) {
    superagent
      .get(GEOCODE + '/reverseGeocode')
      .query({
        f: 'json',
        location: location,
        token: token
      })
      .end(function(err, res) {
        if (err) {
          callback(err, res);
        } else {
          var body = parseResponse(res, callback);
          if (!body || !body.address) {
            callback(new Error('Location not found.'));
          } else {
            var addr = body.address;
            var coordinate = location.split(',');
            callback(null, {
              address: addr.Address,
              neighborhood: addr.Neighborhood,
              city: addr.City,
              county: addr.Subregion,
              state: addr.Region,
              zip: parseInt(addr.Postal, 10),
              country: addr.CountryCode,
              coordinate: {
                lng: coordinate[0],
                lat: coordinate[1]
              }
            });
          }
        }
      });
  });
*/
}

/**
 * Auto suggest
 */

function suggest(text, callback) {
  var q = 'http://nominatim.openstreetmap.org/search' +
          '?format=json&addressdetails=1&' +
          'viewbox=' + southWest[0] + ',' +
          northEast[1] + ',' + northEast[0] + ',' + southWest[1] +
          '&bounded=1' +
          'countrycodes=us&q=' + text;
  superagent
      .get( q )
      .end(function (err, nRes) {
          var inside = false;
          nominatimSuggestions = [];
          for (var i = 0; i < nRes.body.length; i++) {
               nominatimSuggestions.push(nRes.body[i]);
          }

          callback(
             null,
             nominatimSuggestions.slice(0,2)
         );
     });
}

/**
 * Parse
 */

function parseResponse(res, callback) {
  try {
    return JSON.parse(res.text);
  } catch (e) {
    callback(e);
  }
}
