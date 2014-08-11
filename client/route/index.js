var config = require('config');
var debug = require('debug')(config.application() + ':route');
var model = require('model');
var defaults = require('model-defaults');
var session = require('session');

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
  .use(defaults({
    bikeSpeed: 4.1,
    parkingCost: 10,
    vmtRate: 0.56,
    walkSpeed: 1.4
  }))
  .attr('id')
  .attr('bikeSpeed')
  .attr('calories')
  .attr('emissions')
  .attr('factors')
  .attr('fares')
  .attr('finalWalkTime')
  .attr('frequency')
  .attr('mode')
  .attr('parkingCost')
  .attr('score')
  .attr('segments')
  .attr('stats')
  .attr('summary')
  .attr('time')
  .attr('totalCost')
  .attr('totalDistance')
  .attr('totalWalkTime')
  .attr('transitFare')
  .attr('vmtRate')
  .attr('walkDistance')
  .attr('walkSpeed')
  .attr('walkSteps');

/**
 * Other Route specific things
 */

Route.on('construct', function(route) {
  setFrequency(route);
  setTotalWalkTime(route);
  setTransitFare(route);
  setWalkDistance(route);
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

/**
 * Transit Fares
 */

function setTransitFare(route) {
  if (!route.fares() || route.fares().length === 0) return route.transitFare(0);

  var fares = route.fares();
  var totalFare = 0;
  for (var i = 0; i < fares.length; i++) totalFare += fares[i].peak;

  route.transitFare(totalFare);
}

/**
 * Set Walk Distance
 */

function setWalkDistance(route) {
  var segments = route.segments();
  var totalWalkTime = route.finalWalkTime();
  for (var i = 0; i < segments.length; i++) totalWalkTime += segments[i].walkTime;

  route.walkDistance((totalWalkTime / route.walkSpeed() * 0.000621371).toFixed(2));
}
