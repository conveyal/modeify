/**
 * Seconds to minutes
 */

exports.secondsToMinutes = function(s) {
  var m = Math.floor(s / 60);
  var sec = s % 60;
  sec = sec < 10 ? '0' + sec : sec;
  return m + ':' + sec;
};

/**
 * Meters to miles
 */

exports.metersToMiles = function(meters) {
  return milesToString(meters * 0.000621371);
};

/**
 * To Bootstrap Color
 */

exports.toBSColor = function(s) {
  switch (s.toLowerCase()) {
    case 'red':
      return '#d9534f';
    case 'green':
      return '#5cb85c';
    case 'blue':
      return '#428bca';
    case 'yellow':
      return '#ffd247';
    case 'orange':
      return '#f0ad4e';
    default:
      return null;
  }
};

/**
 * Miles to string
 */

function milesToString(miles) {
  if (miles > 10) {
    return Math.round(miles);
  } else {
    return Math.round(miles * 10) / 10;
  }
}
