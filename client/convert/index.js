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
 * Expose `milesToString`
 */

exports.milesToString = milesToString;

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
