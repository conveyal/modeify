var config = require('config');
var debug = require('debug')(config.application() + ':route');
var model = require('model');
var defaults = require('model-defaults');

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
  .use(defaults({
    days: 235,
    bikeSpeed: 4.1,
    parkingCost: 10,
    transit: [],
    vmtRate: 0.56,
    walkSpeed: 1.4
  }))
  .attr('id')
  .attr('access')
  .attr('bikeCalories')
  .attr('bikeDistance')
  .attr('bikeSpeed')
  .attr('calories')
  .attr('cost')
  .attr('days')
  .attr('driveDistance')
  .attr('egress')
  .attr('emissions')
  .attr('modes')
  .attr('parkingCost')
  .attr('score')
  .attr('stats')
  .attr('time')
  .attr('transfers')
  .attr('transitCost')
  .attr('transit')
  .attr('trips')
  .attr('vmtRate')
  .attr('walkCalories')
  .attr('walkDistance')
  .attr('walkSpeed');
