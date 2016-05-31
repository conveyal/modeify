var view = require('view')
var session = require('session')

var AlertRow = require('./row')

/**
 * Expose `View`
 */

var View = view(require('./template.html'), function (view, model) {
  console.log('s-a-v init', model)
})

View.prototype.hasAlerts = function () {
  console.log('hasAlerts?', this.model)
  return this.model.alerts && this.model.alerts.length > 0
}

/**
 * Set the routes view
 */

View.prototype['alerts-view'] = function () {
  return AlertRow
}

module.exports = function () {
  var activeAlerts = session.serviceAlerts().filter(function () {
    return true
  })

  console.log('alerts-view: ', activeAlerts)
  return new View({
    alerts: activeAlerts
  })
}
