var d3 = require('d3')
var localStorageSupported = require('localstorage-supported')()
var log = require('./client/log')('plan:load')
var ProfileScorer = require('otp-profile-score')
var session = require('session')
var store = require('store')

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

module.exports = load

/**
 * Load a plan
 */

function load (Plan, ctx, next) {
  // Get the plan from the session
  ctx.plan = session.plan()

  // If no plan is in session, load it from localStorage or the server
  if (!ctx.plan) ctx.plan = loadPlan(Plan)

  next()
}

/**
 * Load Plan
 */

function loadPlan (Plan) {
  log('loading plan')

  // check if we have a stored plan
  var opts = {}
  if (localStorageSupported) {
    opts = store('plan') || {}
  }

  if (session.isLoggedIn() && session.commuter()) {
    opts = loadCommuter(opts)
  }

  // remove stored patterns & routes
  delete opts.patterns
  delete opts.routes

  opts.scorer = createScorer(opts.scorer)

  var plan = new Plan(opts)
  session.plan(plan)

  return plan
}

/**
 * Load Commuter
 */

function loadCommuter (opts) {
  var commuter = session.commuter()
  log('loading plan for logged in commuter %s', commuter._id())

  // if the stored plan is not the logged in commuters, change
  if (opts._commuter !== commuter._id()) {
    log('load plan from the commuter instead of localStorage')

    opts = commuter.opts()
    var org = commuter._organization()

    opts.from = commuter.fullAddress() || opts.from
    opts.from_ll = commuter.coordinate() || opts.from_ll

    // if there is an organization attached to this commuter
    if (org && org.model) {
      opts.to = org.fullAddress()
      opts.to_ll = org.coordinate()
    }
  }

  return opts
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
