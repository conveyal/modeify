var view = require('../view')
var hogan = require('hogan.js')
var each = require('component-each')
var config = require('../config')

var alertTemplate = hogan.compile(require('./alert.html'))

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
  model.on('change serviceAlerts', function (data) {
    model.emit('change alerts')
  })
})

View.prototype.hasHeader = function () {
  return typeof config.service_alerts === 'function' && config.service_alerts().header
}

View.prototype.hasAlerts = function () {
  return this.model.serviceAlerts && this.model.serviceAlerts.length > 0
}

View.prototype.header = function () {
  return this.hasHeader() ? config.service_alerts().header : ''
}

View.prototype.alerts = function () {
  var alertsHtml = ''
  each(this.model.get('serviceAlerts'), function (alert) {
    alertsHtml += alertTemplate.render(alert)
  })
  return alertsHtml
}
