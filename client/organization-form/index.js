/**
 * Dependencies
 */

var alerts = require('alerts')
var config = require('config')
var debug = require('debug')(config.name() + ':organization-form')
var Organization = require('organization')
var page = require('page')
var serialize = require('serialize')
var template = require('./template.html')
var view = require('view')

/**
 * Create `View`
 */

var View = view(template)

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  debug('render')

  if (ctx.organization) {
    ctx.view = new View(ctx.organization)
  } else {
    ctx.view = new View(new Organization())
  }

  next()
}

/**
 * Action
 */

View.prototype.action = function () {
  return this.model.isNew() ? 'Create' : 'Edit'
}

/**
 * Back
 */

View.prototype.back = function () {
  return this.model.isNew() ? '/manager/organizations' :
    '/manager/organizations/' + this.model._id() + '/show'
}

/**
 * Labels
 */

View.prototype.labels = function () {
  return this.model.labels().length > 0 ? this.model.labels().join(', ') : ''
}

/**
 * Save!
 */

View.prototype.save = function (e) {
  debug('save')
  var data = serialize(this.el)
  data.labels = data.labels && data.labels.length > 0 ? data.labels.split(',') : []
  data.labels = data.labels.map(function (label) {
    return label.trim()
  })
  data.zip = parseInt(data.zip, 10)
  this.model.set(data)

  var text = this.model.isNew() ? 'Created new organization.' :
    'Saved changes to organization.'

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
      page('/manager/organizations/' + self.model._id() + '/show')
    }
  })
}
