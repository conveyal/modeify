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

/**
 * Route to color converter
 */

exports.routeToColor = function(agency, route) {
  var line = route.route_id.split(':')[1].toLowerCase();
  switch (agency) {
    case 'dc':
      if (route.route_type === 1) return colors[line];
      return colors.metrobus;
    case 'fairfax connector':
      return '#' + route.color;
    default:
      return colors[agency];
  }
};

/**
 * Predefined Transit Colors
 */

var colors = {
  'agency#1': '#55b848', // ART
  'agency#3': '#2c9f4b', // Maryland Commute Bus
  art: '#55b848',
  blue: '#0076bf',
  cabi: '#d02228',
  green: '#00a84f',
  mcro: '#355997',
  metrobus: '#173964',
  orange: '#f7931d',
  prtc: '#5398a0',
  red: '#e21836',
  silver: '#a0a2a0',
  yellow: '#ffd200'
};

/*
  ART green #55b848
  Maryland green #2c9f4b
  Montgomery blue #355997
  Potomac blue #5398a0
  Fairfax yellow #faff4c
  Fairfax yellow type #c9b80d
  VRE red #de003a
  VRE blue #255393

  Metrobus #173964
  CaBI #d02228
  Metro Red #e21836
  Metro Orange #f7931d
  Metro Silver #a0a2a0
  Metro Blue #0076bf
  Metro Yellow #ffd200
  Metro Green #00a84f
*/
