/**
 * Geocode
 */

module.exports = function(address, callback) {
  if (!address || address.length < 1) {
    callback('Must enter an address.');
  } else {
    var a = address.split(',');
    $.get(window.CONFIG.GEOCODER_API_URL + '/q/' + a.shift() + '/' + a.join(','),
      function(data, text, xhr) {
        if (xhr.status !== 200) {
          callback(xhr.responseText);
        } else {
          callback(null, data[0]);
        }
      });
  }
};

/**
 * Reverse
 */

module.exports.reverse = function(ll, callback) {
  if (!ll || !ll.lat) {
    callback('Must pass in a lat / lon object.');
  } else {
    var l = ll.lat + ', ' + (ll.lon || ll.lng);
    $.get(window.CONFIG.GEOCODER_API_URL + '/r/' + l, function(data, text, xhr) {
      if (xhr.status !== 200) {
        callback(xhr.responseText);
      } else {
        callback(null, data);
      }
    });
  }
};
