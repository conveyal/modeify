var store = require('browser-store')
var d3 = require('d3')
var log = require('./client/log')('plan:load')
var ProfileScorer = require('otp-profile-score')

/**
 * Calorie Scoring as a function
 */

var defaultCalorieScale = d3.scale.sqrt()
  .domain([0, 125, 200])
  .range([0, -3, 0])
  .exponent(2)

/**
 * Expose `load`
 */

module.exports = loadPlan

/**
 * Load Plan
 */

function loadPlan (Plan, userOpts) {
  log('loading plan')

  // check if we have a stored plan
  var opts = store('plan') || {}

  // set any user-specified options
  userOpts = userOpts || {}
  for (var key in userOpts) {
    opts[key] = userOpts[key]
  }

  // remove stored patterns & routes
  delete opts.patterns
  delete opts.routes

  opts.scorer = createScorer(opts.scorer)

  return new Plan(opts)
}

/**
 * Create Scorer
 */

function createScorer (opts) {
  var scorer = new ProfileScorer()

  if (opts) {
    scorer.factors = opts.factors
    scorer.rates = opts.rates
  }

  scorer.factors.co2 = 0
  scorer.factors.calories = defaultCalorieScale

  return scorer
}
