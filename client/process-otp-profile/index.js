
var d3 = require('d3');

/**
 * Constants
 */

var CO2_PER_GALLON = 8.887; // Kilograms of CO2 burned per gallon of gasoline
var METERS_TO_MILES = 0.000621371;
var MINUTE = 60;

/**
 * Calorie Scale
 */

var scaleCalories = d3.scale.linear()
  .domain([ 0, 100, 200 ])
  .range([ 0, 1, 0 ]);

/**
 * Default factor values
 */

var DEFAULT_FACTORS = {
  bikeParking: 1,
  calories: 3,
  calsBiking: 10,
  calsWalking: 4.4,
  carParking: 5,
  co2: 0.5,
  cost: 5,
  mileageRate: 0.56, // IRS reimbursement rate per mile http://www.irs.gov/2014-Standard-Mileage-Rates-for-Business,-Medical-and-Moving-Announced
  mpg: 21.4,
  transfer: 5
};

/**
 * Expose `ProcessProfile`
 */

module.exports = ProcessProfile;

/**
 * Process an OTP Profile response. Format text, tally statistics, score options
 */

function ProcessProfile(factors) {
  this.factor = factors || DEFAULT_FACTORS;
  this.settings = {};
  this.scaleCalories = scaleCalories;
}

/**
 * Process a list of options
 */

ProcessProfile.prototype.processOptions = function(options) {
  for (var i = 0; i < options.length; i++) {
    // Add an id
    options[i].id = 'option_' + i;
    options[i] = this.processOption(options[i]);
  }

  options.sort(function(a, b) {
    return a.score - b.score;
  });

  return options;
};

/**
 * Process option
 */

ProcessProfile.prototype.processOption = function(o) {
  // Tally the data
  o = this.tally(o);

  // Score the option
  o.score = this.score(o);

  return o;
};

/**
 * Score the option
 */

ProcessProfile.prototype.score = function(o) {
  var score = o.time;

  switch(o.mode) {
    case 'car':
      // Add time for parking
      score += this.factor.carParking;
      break;
    case 'bicycle':
      // Add time for locking your bike
      score += this.factor.bikeParking;
      break;
    case 'walk':

      break;
    default: // Transit only

      break;
  }

  // Add time for each transfer
  score += o.transfers * this.factor.transfer;

  // Add time for each dollar spent
  score += o.totalCost * this.factor.cost;

  // Subtract time for calories burned
  score -= this.scaleCalories(o.calories) * this.factor.calories;

  // Add time for CO2 emissions
  score += o.emissions * this.factor.co2;

  return score;
};

/**
 * Tally values
 */

ProcessProfile.prototype.tally = function(o) {
  o.time = o.stats.avg / MINUTE;
  o.calories = 0;
  o.totalCost = totalFare(o);
  o.totalDistance = walkStepsDistance(o);
  o.transfers = o.segments.length;

  // Set emissions for all, will show negative for bike/walk
  o.emissions = this.factor.mpg / o.totalDistance * CO2_PER_GALLON;

  // Set the primary mode
  o.mode = o.summary.length < 8
    ? o.summary.toLowerCase()
    : primaryMode(o);

  switch(o.mode) {
    case 'car':
      o.totalCost += this.factor.mileageRate * o.totalDistance;
      break;
    case 'bicycle':
      o.calories = this.factor.calsBiking * o.time;
      break;
    case 'walk':
      o.calories = this.factor.calsWalking * o.time;
      break;
    default: // Transit only for now
      o.calories = transitCals(o, this.factor.calsWalking);
      o.frequency = frequency(o, this.settings.timeWindow);
      break;
  }

  return o;
};

/**
 * Transit Walking Segment Cals
 */

function transitCals(o, calsWalking) {
  return o.segments.reduce(function(calories, segment) {
    return calories + calsWalking * (segment.walkTime / MINUTE);
  }, 0) + calsWalking * (o.finalWalkTime / MINUTE);
}

/**
 * Total Distance of Walk Steps
 */

function walkStepsDistance(o) {
  if (!o.walkSteps || o.walkSteps.length < 1) return 0;
  return METERS_TO_MILES * o.walkSteps.reduce(function(distance, step) {
    return distance + step.distance;
  }, 0);
}

/**
 * Calculate the total fare
 */

function totalFare(o) {
  if (!o.fares || o.fares.length < 1) return 0;
  return o.fares.reduce(function(total, fare) {
    return total + fare.peak;
  }, 0);
}

/**
 * Get primary mode
 */

function primaryMode(o) {
  var max = -Infinity;
  var mode = '';

  for (var i = 0; i < o.segments.length; i++) {
    var time = o.segments[i].waitStats.avg + o.segments[i].rideStats.avg;
    if (time > max) mode = o.segments[i].mode.toLowerCase();
  }

  return mode;
}

/**
 * Get the frequency of a transit option
 */

function frequency(o, timeWindow) {
  var patterns = o.segments.reduce(function(memo, segment) {
    return memo.concat(segment.segmentPatterns);
  }, []);

  return patterns.reduce(function(memo, pattern) {
    var nTrips = timeWindow / pattern.nTrips;
    if (nTrips < memo) return nTrips;
    else return memo;
  }, Infinity);
}
