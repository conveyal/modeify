var cookie = require('component-cookie')
var localStorageSupported = require('../localstorage-supported')()
var store = require('yields-store')

var THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

module.exports = function (name, object) {
  if (arguments.length === 1) {
    return get(name)
  } else {
    return set(name, object)
  }
}

function set (name, object) {
  if (localStorageSupported) {
    store(name, object)
  } else {
    cookie(name, JSON.stringify(object), {
      maxage: THIRTY_DAYS
    })
  }
}

function get (name) {
  if (localStorageSupported) {
    return store(name)
  } else {
    return JSON.parse(cookie(name))
  }
}
