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
  .attr('bikeTime')
  .attr('calories')
  .attr('cost')
  .attr('costDifference')
  .attr('driveDistance')
  .attr('egress')
  .attr('emissions')
  .attr('hasTransit')
  .attr('modes')
  .attr('pounds')
  .attr('score')
  .attr('stats')
  .attr('time')
  .attr('timeCost')
  .attr('transfers')
  .attr('transitCost')
  .attr('transit')
  .attr('trips')
  .attr('walkCalories')
  .attr('walkDistance')
  .attr('walkTime');

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
  this.emit('change bikeTime', this.bikeTime());
  this.emit('change calculatedCost', this.calculatedCost());
  this.emit('change calculatedCalories', this.calculatedCalories());
  this.emit('change transitCosts', this.transitCosts());
  this.emit('change tripsPerYear', this.tripsPerYear());
  this.emit('change carParkingCost', this.carParkingCost());
  this.emit('change vmtRate', this.vmtRate());
  this.emit('change walkTime', this.walkTime());
};

/**
 * Set car data
 */

Route.prototype.setCarData = function(data) {
  var m = this.tripm();
  this.costDifference(toFixed((data.cost * m - this.cost() * m) / 1000, 1));
  this.pounds(this.calories() * m / 3500 | 0);
  this.timeCost((m * (this.time() / 60 / 24)) | 0);
};

/**
 * Average trip length in minutes
 */

Route.prototype.average = function() {
  return Math.round(this.time());
};

/**
 * Has transit?
 */

Route.prototype.hasTransit = function() {
  return this.transit().length > 0;
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
    return toFixed(total / 1000, 1) + 'k';
  } else if (total > 100) {
    return total | 0;
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

  var cals = walkingCaloriesBurned(this.walkSpeed(), this.weight(), (this.walkDistances() / this.walkSpeed()));
  if (this.modes().indexOf('bicycle') !== -1) {
    cals += bikingCaloriesBurned(this.bikeSpeed(), this.weight(), (this.bikeDistances() / this.bikeSpeed()));
  }
  var total = cals * this.tripm();
  return total > 1000 ? toFixed(total / 1000, 1) + 'k' : total | 0;
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

  return Math.round(60 / (trips / (end - start)));
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
  return toFixed(this.bikeSpeed() * MPS_TO_MPH, 1);
};

Route.prototype.walkSpeedMph = function() {
  return toFixed(this.walkSpeed() * MPS_TO_MPH, 1);
};

/**
 * Walk/bike time in minutes
 */

Route.prototype.bikeTime = function() {
  var d = this.bikeDistance();
  var s = this.bikeSpeed();
  var t = d / s;

  if (t < 60) return '< 1';
  else return parseInt(t / 60);
};

Route.prototype.walkTime = function() {
  var d = this.walkDistance();
  var s = this.walkSpeed();
  var t = d / s;

  if (t < 60) return '< 1';
  else return parseInt(t / 60);
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
 * Walking Calories
 *
 * CB = [0.0215 x KPH3 - 0.1765 x KPH2 + 0.8710 x KPH + 1.4577] x WKG x T
 * http://www.shapesense.com/fitness-exercise/calculators/walking-calorie-burn-calculator.aspx
 */

function walkingCaloriesBurned(mps, wkg, hours) {
  var kph = mps / 1000 * 60 * 60;
  var kph2 = kph * kph;
  var kph3 = kph2 * kph;
  return (0.0215 * kph3 - 0.1765 * kph2 + 0.8710 * kph) * wkg * hours;
}

/**
 * Biking Calories
 *
 * http://en.wikipedia.org/wiki/Bicycle_performance
 */

var GRADE = 1;
var GRAVITY = 9.8;
var K1 = 0.0053; // frictional losses
var K2 = 0.185; // aerodynamic drag
var WATTS_TO_CALS_PER_SECOND = 0.2388;

function bikingCaloriesBurned(mps, wkg, hours) {
  var mps3 = Math.pow(mps, 3);
  var seconds = hours * 60 * 60;
  var watts = GRAVITY * wkg * mps * (K1 + GRADE) + K2 * mps3;
  return watts * WATTS_TO_CALS_PER_SECOND * seconds;
}

function toFixed(n, f) {
  var m = Math.pow(10, f);
  return ((n * m) | 0) / m;
}
