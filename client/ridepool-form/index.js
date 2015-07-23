var alerts = require('alerts')
var Ridepool = require('ridepool')
var log = require('log')('ridepool-form')
var page = require('page')
var serialize = require('serialize')
var view = require('view')

var View = view(require('./template.html'))

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View(ctx.ridepool || new Ridepool(), {
    organization: ctx.organization
  })

  next()
}

View.prototype.action = function () {
  return this.model.isNew() ? 'Create' : 'Edit'
}

View.prototype.back = function () {
  var prefix = '/manager/organizations/' + this.options.organization._id()
  return prefix + (this.model.isNew() ? '/show' : '/ridepools/' + this.model._id() + '/show')
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
