var config = require('config');
var debug = require('debug')(config.application() + ':route');
var model = require('model');
var session = require('session');

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
  .attr('id')
  .attr('calories')
  .attr('emissions')
  .attr('factors')
  .attr('finalWalkTime')
  .attr('frequency')
  .attr('mode')
  .attr('score')
  .attr('segments')
  .attr('stats')
  .attr('summary')
  .attr('time')
  .attr('totalCost')
  .attr('totalDistance')
  .attr('totalWalkTime')
  .attr('walkSteps');

/**
 * Other Route specific things
 */

Route.on('construct', function(route) {
  setFrequency(route);
  setTotalWalkTime(route);
});

/**
 * Set frequency
 */

function setFrequency(route) {
  if (route.segments().length === 0) return route.frequency(false);

  var start = session.plan().start_time();
  var end = session.plan().end_time();
  var tripsPerBlock = route.segments().reduce(function(min, segment) {
    var nTrips = segment.segmentPatterns.reduce(function(max, pattern) {
      return pattern.nTrips > max ? pattern.nTrips : max;
    }, -Infinity);
    return nTrips < min ? nTrips : min;
  }, Infinity);

  route.frequency(Math.round(tripsPerBlock / (end - start)));
}

/**
 * Set total walk time
 */

function setTotalWalkTime(route) {
  if (route.segments().length === 0) return route.totalWalkTime(false);

  var segments = route.segments();
  var totalWalkTime = route.finalWalkTime();
  for (var i = 0; i < segments.length; i++) totalWalkTime += segments[i].walkTime;
  route.totalWalkTime(Math.round(totalWalkTime / 60));
}
