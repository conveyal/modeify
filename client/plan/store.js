var localStorageSupported = require('localstorage-supported')()
var log = require('./client/log')('plan:store')
var session = require('session')
var store = require('store')

/**
 * Expose `storePlan`
 */

module.exports = storePlan

/**
 * Store a plan
 */

function storePlan (plan) {
  log('--> storing plan')
  if (!localStorageSupported) return

  // convert to "JSON", remove routes & patterns
  var json = {}
  for (var key in plan.attrs) {
    if (key === 'journey' || key === 'options' || key === 'scorer') continue
    json[key] = plan.attrs[key]
  }

  // if we've created a commuter object, save to the commuter
  var commuter = session.commuter()
  if (commuter) {
    json._commuter = commuter._id()
    commuter.opts(json)
    commuter.save()
  }

  // save in local storage
  try {
    store('plan', json)
    log('<-- stored plan')
  } catch (e) {
    log.error('<-- failed to store plan %e', e)
  }

  return json
}

/**
 * Clear storage
 */

module.exports.clear = function () {
  if (localStorageSupported) {
    store('plan', null)
  }
}
