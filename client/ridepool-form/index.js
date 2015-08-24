var alerts = require('alerts')
var Ridepool = require('ridepool')
var log = require('log')('ridepool-form')
var page = require('page')
var serialize = require('serialize')
var view = require('view')
var Location = require('location')

var View = view(require('./template.html'))

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View(ctx.ridepool || new Ridepool(), {
    organization: ctx.organization
  })

  ctx.view.refreshLocations()

  next()
}

View.prototype.action = function () {
  return this.model.isNew() ? 'Create' : 'Edit'
}

View.prototype.organizationId = function () {
  return this.options.organization.get('_id')
}

View.prototype.organizationName = function () {
  return this.options.organization.get('name')
}

/**
 * Save!
 */

View.prototype.save = function (e) {
  log('saving')

  this.model.set(serialize(this.el))
  this.model.created_by(this.options.organization._id())
  var text = this.model.isNew() ? 'Created new ridepool.' : 'Saved changes to ridepool.'
  var self = this
  this.model.save(function (err) {
    if (err) {
      alerts.show({
        type: 'danger',
        text: err
      })
    } else {
      alerts.push({
        type: 'success',
        text: text
      })
      page('/manager/organizations/' + self.options.organization._id() + '/show')
    }
  })
}

View.prototype.refreshLocations = function (e) {
  var view = this
  var ctx = {
    params: { organization: this.options.organization.get('_id') }
  }
  Location.loadOrg(ctx, function () {
    ctx.locations.forEach(function (location) {
      document.getElementById('from-locations').appendChild(getOption(location, view.model.get('from')))
      document.getElementById('to-locations').appendChild(getOption(location, view.model.get('to')))
    })
  })
}

function getOption (location, idToSelect) {
  var option = document.createElement('option')
  option.text = location.get('name') || (location.get('address') + ', ' + location.get('city'))
  option.value = location.get('_id')
  if (location.get('_id') === idToSelect) option.selected = true
  return option
}
