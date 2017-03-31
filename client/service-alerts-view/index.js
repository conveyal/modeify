var moment = require('moment')

var AlertRow = require('./row')
var view = require('../view')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
  model.on('change serviceAlerts', (alerts) => {
    alerts = (alerts || []).filter(function (alert) {
      var today = moment()
      var fromDate = moment.utc(alert.fromDate)
      var toDate = moment.utc(alert.toDate)
      return !fromDate.isAfter(today, 'days') && !toDate.isBefore(today, 'days')
    })
    view.emit('change alerts', alerts)
  })
})

View.prototype.hasAlerts = function () {
  return this.model.alerts && this.model.alerts.length > 0
}

/**
 * Set the routes view
 */

View.prototype['alerts-view'] = function () {
  return AlertRow
}
