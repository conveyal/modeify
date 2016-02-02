var alerts = require('alerts')
var Location = require('location')
var log = require('./client/log')('location-form')
var page = require('page')
var serialize = require('serialize')
var view = require('view')
var LocationSuggest = require('location-suggest')
var extend = require('extend')

var View = view(require('./template.html'))

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View(ctx.location || new Location(), {
    organization: ctx.organization
  })

  next()
}

extend(View.prototype, LocationSuggest.prototype)

View.prototype.action = function () {
  return this.model.isNew() ? 'Create' : 'Edit'
}

View.prototype.organizationId = function () {
  return this.options.organization.get('_id')
}

View.prototype.organizationName = function () {
  return this.options.organization.get('name')
}

View.prototype.back = function () {
  var prefix = '/manager/organizations/' + this.options.organization._id()
  return prefix + (this.model.isNew() ? '/show' : '/locations/' + this.model._id() + '/show')
}

View.prototype.locationSelected = function (target) {}

/**
 * Save!
 */

View.prototype.save = function (e) {
  log('saving')

  this.model.set(serialize(this.el))
  this.model.created_by(this.options.organization._id())

  var text = this.model.isNew() ? 'Created new location.' : 'Saved changes to location.'
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
      page('/manager/organizations/' + self.options.organization._id() + '/locations/' + self.model._id() + '/show')
    }
  })
}
