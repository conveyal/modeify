var config = require('config');
var convert = require('convert');
var debug = require('debug')(config.application() + ':route');
var model = require('model');
var defaults = require('model-defaults');
var session = require('session');

/**
 * MPS to MPH
 */

var MPS_TO_MPH = 2.23694;

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
  .use(defaults({
    transit: []
  }))
  .attr('id')
  .attr('access')
  .attr('bikeCalories')
  .attr('bikeDistance')
  .attr('calories')
  .attr('cost')
  .attr('driveDistance')
  .attr('egress')
  .attr('emissions')
  .attr('modes')
  .attr('score')
  .attr('stats')
  .attr('time')
  .attr('transfers')
  .attr('transitCost')
  .attr('transit')
  .attr('trips')
  .attr('walkCalories')
  .attr('walkDistance');

/**
 * Update scoring
 */

Route.prototype.rescore = function(scorer) {
  var data = scorer.processOption(this.toJSON());

  for (var i in data) {
    if (this.hasOwnProperty(i) && i !== 'transitCost') {
      this[i](data[i]);
    }
  }

  this.emit('change average', this.average());
  this.emit('change calculatedCost', this.calculatedCost());
  this.emit('change calculatedCalories', this.calculatedCalories());
  this.emit('change transitCosts', this.transitCosts());
  this.emit('change tripsPerYear', this.tripsPerYear());
  this.emit('change carParkingCost', this.carParkingCost());
  this.emit('change vmtRate', this.vmtRate());
};

/**
 * Average trip length in minutes
 */

Route.prototype.average = function() {
  return Math.round(this.time());
};

/**
 * Days
 */

Route.prototype.tripsPerYear = function() {
  return session.plan().tripsPerYear();
};

/**
 * Trip multiplier
 */

Route.prototype.tripm = function() {
  var plan = session.plan();
  return plan.per_year() ? plan.tripsPerYear() : 1;
};

/**
 * Cost
 */

Route.prototype.calculatedCost = function() {
  if (this.cost() === 0) return false;
  var cost = 0;
  if (this.transitCost()) cost += this.transitCost();
  if (this.modes().indexOf('car') !== -1) {
    cost += this.vmtRate() * this.driveDistances();
    cost += this.carParkingCost();
  }

  var total = cost * this.tripm();
  if (total > 1000) {
    return (total / 1000).toFixed(1) + 'k';
  } else if (total > 100) {
    return total.toFixed(0);
  } else {
    return total.toFixed(2);
  }
};

/**
 * Transit Cost
 */

Route.prototype.transitCosts = function() {
  if (!this.transitCost()) return false;
  return this.transitCost().toFixed(2);
};

/**
 * Calories
 */

Route.prototype.calculatedCalories = function() {
  if (this.calories() === 0) return false;
  var cals = caloriesBurned(3.8, this.weight(), (this.walkDistances() / this.walkSpeed()));
  if (this.modes().indexOf('bicycle') !== -1) {
    cals += caloriesBurned(8, this.weight(), (this.bikeDistances() / this.bikeSpeed()));
  }
  var total = cals * this.tripm();
  return total > 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0);
};

/**
 * Frequency
 */

Route.prototype.frequency = function() {
  var trips = this.trips();
  if (!trips) return false;

  var plan = session.plan();
  var start = plan.start_time();
  var end = plan.end_time();

  return Math.round(trips / (end - start));
};

/**
 * Walk/Bike distances rounded
 */

Route.prototype.driveDistances = function() {
  return this.distances('car', 'driveDistance');
};

Route.prototype.bikeDistances = function() {
  return this.distances('bicycle', 'bikeDistance');
};

Route.prototype.walkDistances = function() {
  return this.distances('walk', 'walkDistance');
};

Route.prototype.distances = function(mode, val) {
  if (this.modes().indexOf(mode) === -1) return false;
  return convert.metersToMiles(this[val]());
};

/**
 * Walk/bike speed in MPH
 */

Route.prototype.bikeSpeedMph = function() {
  return (this.bikeSpeed() * MPS_TO_MPH).toFixed(1);
};

Route.prototype.walkSpeedMph = function() {
  return (this.walkSpeed() * MPS_TO_MPH).toFixed(1);
};

/**
 * Retrieve from scorer
 */

Route.prototype.bikeSpeed = function() {
  return session.plan().scorer().rates.bikeSpeed;
};

Route.prototype.walkSpeed = function() {
  return session.plan().scorer().rates.walkSpeed;
};

Route.prototype.vmtRate = function() {
  return session.plan().scorer().rates.mileageRate;
};

Route.prototype.weight = function() {
  return session.plan().scorer().rates.weight;
};

Route.prototype.carParkingCost = function() {
  return session.plan().scorer().rates.carParkingCost;
};

/**
 * MET Cals burned
 */

function caloriesBurned(met, kg, hours) {
  return met * kg * hours;
}
