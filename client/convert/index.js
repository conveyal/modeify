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
    case 'red line':
      return '#d9534f';
    case 'green line':
      return '#5cb85c';
    case 'blue line':
      return '#428bca';
    case 'yellow line':
      return '#ffd247';
    case 'orange line':
      return '#f0ad4e';
    default:
      return null;
  }
};

/**
 * Miles to string
 */

function milesToString(miles) {
  var output;
  if (miles > 10) {
    output = Math.round(miles);
  } else if (miles > 1) {
    output = Math.round(miles * 10) / 10;
  } else {
    output = Math.round(miles * 100) / 100;
  }
  return output;
}
