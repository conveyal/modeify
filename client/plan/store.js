var log = require('../log')('plan:store')
var store = require('../browser-store')

/**
 * Expose `storePlan`
 */

module.exports = storePlan

/**
 * Store a plan
 */

function storePlan (plan) {
  log('--> storing plan')

  // convert to "JSON", remove routes & patterns
  var json = {}
  for (var key in plan.attrs) {
    if (key === 'journey' || key === 'options' || key === 'scorer') continue
    json[key] = plan.attrs[key]
  }

  // save in local storage
  store('plan', json)
  log('<-- stored plan')

  return json
}

/**
 * Clear storage
 */

module.exports.clear = function () {
  store('plan', null)
}
