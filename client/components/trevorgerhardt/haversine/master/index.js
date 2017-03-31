/**
 * Get the haversine distance between two points
 *
 * @param {Number} starting latitude
 * @param {Number} starting longitude
 * @param {Number} ending latitude
 * @param {Number} ending longitude
 * @param {Boolean} return the distance in miles instead of kilometers
 * @returns {Number} distance between the points
 */

module.exports = function haversine(lat1, lon1, lat2, lon2, miles) {
  var R = miles ? 3960 : 6371;

  var dLat = rad(lat2 - lat1);
  var dLon = rad(lon2 - lon1);

  lat1 = rad(lat1);
  lat2 = rad(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Convert a lat/lon point to radians
 *
 * @param {Number} n
 * @returns {Number} r
 */

function rad(n) {
  return n * Math.PI / 180;
}
