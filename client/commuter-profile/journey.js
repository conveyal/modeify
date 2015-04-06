var Alert = require('alert')
var log = require('./client/log')('commuter-profile:journey')
var modal = require('./client/modal')
var session = require('session')
var view = require('view')

/**
 * Expose `Row`
 */

var Row = module.exports = view(require('./journey.html'))

/**
 * From
 */

Row.prototype.from = function () {
  return this.model.locations()[0].original_address
}

/**
 * To
 */

Row.prototype.to = function () {
  return this.model.locations()[1].original_address
}

/**
 * Load
 */

Row.prototype.load = function (e) {
  e.preventDefault()
  if (this.destroying) return

  var locations = this.model.locations()
  var plan = session.plan()
  var from = locations[0]
  var to = locations[1]

  plan.set({
    from: from.original_address,
    from_id: from._id,
    from_ll: from.coordinate,
    to: to.original_address,
    to_id: to._id,
    to_ll: to.coordinate
  })

  plan.updateRoutes()
  modal.hide()
}

/**
 * Destroy
 */

Row.prototype.destroy = function (e) {
  e.preventDefault()
  this.destroying = true

  var alerts = document.querySelector('.journey-alerts')
  var self = this
  this.model.destroy(function (err) {
    if (err) {
      log.error('%j', err)
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to remove journey.'
      }).el)
    } else {
      self.el.remove()
    }
  })
}
