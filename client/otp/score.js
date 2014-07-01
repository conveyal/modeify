
var convert = require('convert');

/**
 * Constants
 */

var CO2_PER_GALLON = 8.887; // Kilograms of CO2 burned per gallon of gasoline
var MINUTE = 60;

/**
 * Factors
 */

var factor = {
  bikeParking: 1,
  calories: 3,
  calsBiking: 10,
  calsWalking: 4.4,
  carParking: 1,
  co2: 0.5,
  cost: 5,
  mileageRate: 0.56, // IRS reimbursement rate per mile http://www.irs.gov/2014-Standard-Mileage-Rates-for-Business,-Medical-and-Moving-Announced
  mpg: 21.4,
  transfer: 5
};

/**
 * Expose `score`
 */

module.exports = score;

/**
 * Expose `factors`
 */

module.exports.factor = factor;

/**
 * Score the option
 */

function score(o) {


  // Add time for each transfer
  o.score += o.transfers * factor.transfer;

  // Add time for each dollar spent
  o.score += o.totalCost * factor.cost;

  // Subtract time for calories burned
  o.score -= (o.calories / 100) * factor.calories;

  // Add time for CO2 emissions
  o.score += o.emissions * factor.co2;
}

/**
 * Tally values
 */

function tallyValues(o) {
  o.time = o.stats.avg / MINUTE;
  o.score = o.time;
  o.calories = 0;
  o.emissions = 0;
  o.totalCost = totalFare(o);
  o.totalDistance = walkStepsDistance(o);
  o.transfers = o.segments.length;

  switch(o.summary) {
    case 'CAR':
      o.emissions = o.totalDistance / factor.mpg * CO2_PER_GALLON;
      o.totalCost += factor.mileageRate * o.totalDistance;

      // Add time for parking
      o.score += factor.carParking;
      break;
    case 'BICYCLE':
      o.calories = factor.calsBiking * o.time;

      // Add time for locking your bike
      o.score += factor.bikeParking;
      break;
    case 'WALK':
      o.calories = factor.calsWalking * o.time;
      break;
    default: // Transit only for now
      o.calories = transitCals(o);
      o.calories += factor.calsWalking * (o.finalWalkTime / MINUTE);
      break;
  }
}

/**
 * Total Distance of Walk Steps
 */

function walkStepsDistance(o) {
  if (!o.walkSteps || o.walkSteps.length < 1) return 0;
  return convert.metersToMiles(o.walkSteps.reduce(function(distance, step) {
    return distance + step.distance;
  }, 0));
}

/**
 * Transit Walking Segment Cals
 */

function transitCals(o) {
  return o.segments.reduce(function(calories, segment) {
    return calories + factor.calsWalking * (segment.walkTime / MINUTE);
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
