var AlertRow = require('./row')
var view = require('../view')
var config = require('../config')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'))

View.prototype.hasHeader = function () {
  return typeof config.service_alerts === 'function' && config.service_alerts().header
}

View.prototype.hasAlerts = function () {
  return this.model.serviceAlerts && this.model.serviceAlerts.length > 0
}

View.prototype.header = function () {
  return this.hasHeader() ? config.service_alerts().header : ''
}

/**
 * Set the routes view
 */

View.prototype['serviceAlerts-view'] = function () {
  return AlertRow
}
