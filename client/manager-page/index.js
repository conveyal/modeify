var alerts = require('alerts')
var page = require('page')
var view = require('view')

var rowTemplate = require('./row.html')
var template = require('./template.html')

var Row = view(rowTemplate)
var View = view(template)

module.exports = function (ctx, next) {
  // Two way binding isn't cool
  ctx.organizations.map(function (org) {
    org.manager = ctx.manager
  })
  ctx.manager.organizations = ctx.organizations

  ctx.view = new View(ctx.manager)
  next()
}

View.prototype['organizations-view'] = function () {
  return Row
}

Row.prototype.isManager = function () {
  return this.model.manager.inGroups(['organization-' + this.model._id() + '-manager'])
}

Row.prototype.toggleManager = function () {
  var org = this.model
  var manager = org.manager
  alerts.clear()
  if (this.isManager()) {
    manager.revokeManagementPermission(org._id(), function (err) {
      if (err) {
        alerts.show({
          type: 'danger',
          text: err.message || err
        })
      } else {
        alerts.push({
          type: 'success',
          text: 'Removed permissions for ' + org.name() + '.'
        })
        page('/manager/managers/' + manager.id() + '/show')
      }
    })
  } else {
    manager.grantManagementPermission(org._id(), function (err) {
      if (err) {
        alerts.show({
          type: 'danger',
          text: err.message || err
        })
      } else {
        alerts.push({
          type: 'success',
          text: 'Added management permissions for ' + org.name() + '.'
        })
        page('/manager/managers/' + manager.id() + '/show')
      }
    })
  }
}
