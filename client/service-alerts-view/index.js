var AlertRow = require('./row')
var view = require('../view')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'))

View.prototype.hasAlerts = function () {
  return this.model.serviceAlerts && this.model.serviceAlerts.length > 0
}

/**
 * Set the routes view
 */

View.prototype['serviceAlerts-view'] = function () {
  return AlertRow
}
