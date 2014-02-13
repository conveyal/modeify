window.CONFIG.GEOCODER_API_URL =
  'http://cherriots.dev.conveyal.com/simplecoder';
window.CONFIG.MAPBOX_KEY = 'conveyal.gepida3i';
window.CONFIG.FROM_LL = [38.890519, -77.086252];
window.CONFIG.TO_LL = [38.896813, -77.006262];

/**
 * Dependencies
 */

var onLoad = require('on-load');
var router = require('planner-router');

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // listen
  router.listen('/planner');
});
