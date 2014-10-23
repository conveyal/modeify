var clone;
try {
  clone = require('clone');
} catch (e) {
  clone = require('component-clone');
}

/**
 * Constants
 */

var CO2_PER_GALLON = 8.887; // Kilograms of CO2 burned per gallon of gasoline
var CYCLING_MET = 8; // Find MET scores here: http://appliedresearch.cancer.gov/atus-met/met.php
var METERS_TO_MILES = 0.000621371;
var SECONDS_TO_HOURS = 1 / 60 / 60;
var WALKING_MET = 3.8;

/**
 * Default factor values
 */

var DEFAULT_TIME_FACTORS = {
  bikeParking: 1,
  calories: -0.01,
  carParking: 5,
  co2: 0.5,
  cost: 5,
  transfer: 5
};

/**
 * Default costs
 */

var DEFAULT_RATES = {
  bikeSpeed: 4.1, // in m/s
  carParkingCost: 10,
  mileageRate: 0.56, // IRS reimbursement rate per mile http://www.irs.gov/2014-Standard-Mileage-Rates-for-Business,-Medical-and-Moving-Announced
  mpg: 21.4,
  walkSpeed: 1.4, // in m/s
  weight: 75 // in kilograms
};

/**
 * Expose `ProfileScore`
 */

module.exports = ProfileScore;

/**
 * Process & score an OTP Profile response. Tally statistics, score options
 */

function ProfileScore(opts) {
  opts = opts || {};

  this.factors = merge(DEFAULT_TIME_FACTORS, opts.factors || {});
  this.rates = merge(DEFAULT_RATES, opts.rates || {});
}

/**
 * Process a list of options
 */

ProfileScore.prototype.processOptions = function(options) {
  var id = 0;
  var processed = [];
  for (var i = 0; i < options.length; i++) {
    var o = options[i];

    if (o.access) {
      // Split each option by access mode and score individually
      for (var j = 0; j < o.access.length; j++) {
        var opt = clone(o);
        opt.access = [opt.access[j]];
        processed.push(this.processOption(opt));
      }
    }
  }

  processed.sort(function(a, b) {
    return a.score - b.score;
  });

  return processed;
};

/**
 * Process option, only uses the first access and egress modes given
 */

ProfileScore.prototype.processOption = function(o) {
  // Tally the data
  o = this.tally(o);

  // Score the option
  o.score = this.score(o);

  return o;
};

/**
 * Score the option
 */

ProfileScore.prototype.score = function(o) {
  var factors = this.factors;
  var score = o.time;
  var totalCalories = 0;

  o.modes.forEach(function(mode) {
    switch (mode) {
      case 'car':
        // Add time for parking
        score += af(1, factors.carParking);

        // Add time for CO2 emissions
        score += af(o.emissions, factors.co2);
        break;
      case 'bicycle':
        // Add time for locking your bike
        score += af(1, factors.bikeParking);
        totalCalories += o.bikeCalories;
        break;
      case 'walk':
        totalCalories += o.walkCalories;
        break;
    }
  });

  // Add time for each transfer
  score += af(o.transfers, this.factors.transfer);

  // Add time for each dollar spent
  score += af(o.cost, this.factors.cost);

  // Add/subtract time for calories
  score += af(totalCalories, this.factors.calories);

  return score;
};

/**
 * Tally values
 */

ProfileScore.prototype.tally = function(o) {
  // Defaults
  o.bikeCalories = 0;
  o.calories = 0;
  o.cost = 0;
  o.emissions = 0;
  o.modes = [];
  o.transfers = 0;
  o.walkCalories = 0;

  // Bike/Drive/Walk distances
  o.bikeDistance = 0;
  o.driveDistance = 0;
  o.walkDistance = 0;

  // Tally access
  var access = o.access[0];
  var accessDistance = walkStepsDistance(access);
  var accessMode = access.mode.toLowerCase();

  o.modes.push(accessMode);
  o.time = access.time / 60;
  switch (accessMode) {
    case 'car':
      o.driveDistance = accessDistance;

      o.carCost = this.rates.mileageRate * (o.driveDistance * METERS_TO_MILES) +
        this.rates.carParkingCost;
      o.cost += o.carCost;
      o.emissions = o.driveDistance / this.rates.mpg * CO2_PER_GALLON;
      break;
    case 'bicycle':
      o.bikeDistance = accessDistance;
      o.bikeCalories = caloriesBurned(CYCLING_MET, this.rates.weight, o.time /
        60);
      break;
    case 'walk':
      o.walkDistance = accessDistance;
      break;
  }

  // Tally egress
  if (o.egress && o.egress.length > 0) {
    if (o.modes.indexOf('walk') === -1) o.modes.push('walk');
    o.time += o.egress[0].time / 60;
    o.walkDistance += walkStepsDistance(o.egress[0]);
  }

  // Tally transit
  if (o.transit && o.transit.length > 0) {
    o.transfers = o.transit.length - 1;
    o.transitCost = 0;
    o.trips = Infinity;

    o.transit.forEach(function(segment) {
      var mode = segment.mode.toLowerCase();
      if (o.modes.indexOf(mode) === -1) o.modes.push(mode);

      var trips = segment.segmentPatterns[0].nTrips;
      if (trips < o.trips) o.trips = trips;

      // Add walk time, wait time, & ride time
      o.time += (segment.walkTime + segment.waitStats.avg + segment.rideStats.avg) / 60;

      // Increment the total walk distance
      o.walkDistance += segment.walkDistance;
    });

    o.fares.forEach(function(fare) {
      if (fare) o.transitCost += fare.peak;
    });

    o.cost += o.transitCost;
  }

  // Set the walking calories burned
  if (o.modes.indexOf('walk') !== -1)
    o.walkCalories = caloriesBurned(WALKING_MET, this.rates.weight, (o.walkDistance /
      this.rates.walkSpeed) * SECONDS_TO_HOURS);

  // Total calories
  o.calories = o.bikeCalories + o.walkCalories;

  return o;
};

/**
 * Total Distance of Walk Steps
 */

function walkStepsDistance(o) {
  return o.walkSteps.reduce(function(distance, step) {
    return distance + step.distance;
  }, 0);
}

/**
 * Calories burned based on met score, weight and time
 */

function caloriesBurned(met, kg, hours) {
  return met * kg * hours;
}

/**
 * Apply factor
 */

function af(v, f) {
  if (typeof f === 'function') {
    return f(v);
  } else {
    return f * v;
  }
}

/**
 * Merge
 */

function merge(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}
