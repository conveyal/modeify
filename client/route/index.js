var config = require('config');
var debug = require('debug')(config.application() + ':route');
var model = require('model');

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
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
  .attr('walkSteps');

/**
 * Other Route specific things
 */


