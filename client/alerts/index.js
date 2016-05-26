var Alert = require('../alert')
var domify = require('domify')
var log = require('../log')('alerts')
var each = require('component-each')

/**
 * Alerts
 */

var alerts = []
var el = null

/**
 * Expose `render` middleware
 */

module.exports = function (ctx, next) {
  log('displaying alerts')

  // remove all alerts
  if (el) el.innerHTML = ''

  // create all alerts in local storage
  each(alerts, function (info) {
    newAlert(info)
  })

  // reset local storage
  alerts = []

  // create all alerts in the query parameters
  each(ctx.query, function (name, val) {
    switch (name) {
      case 'danger':
      case 'info':
      case 'success':
      case 'warning':
        newAlert({
          type: name,
          text: val
        })
        break
    }
  })

  next()
}

function addBar () {
  document.body.insertBefore(domify(require('./template.html')), document.body.firstChild.nextSibling)
  return document.getElementById('alerts')
}

/**
 * Clear
 */

module.exports.clear = function () {
  if (el) el.innerHTML = ''
}

/**
 * Push
 */

module.exports.push = function (info) {
  alerts = [info].concat(alerts)
}

/**
 * Show
 */

module.exports.show = function (info) {
  return newAlert(info)
}

/**
 * Alert!
 */

function newAlert (o) {
  if (!el) el = addBar()

  var al = new Alert(o)
  el.appendChild(al.el)
  return al
}
