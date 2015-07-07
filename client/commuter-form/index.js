var Alert = require('alert')
var alerts = require('alerts')
var Commuter = require('commuter')
var config = require('config')
var debug = require('debug')(config.name() + ':commuter-form')
var page = require('page')
var serialize = require('serialize')
var view = require('view')

/**
 * Create `View`
 */

var View = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Commuter Form'
})

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  debug('render')

  if (ctx.commuter) {
    ctx.view = new View(ctx.commuter)
    ctx.view.organization = ctx.organization
  } else {
    ctx.view = new View(new Commuter({
      _organization: ctx.params.organization
    }))
  }

  next()
}

/**
 * Action
 */

View.prototype.action = function () {
  if (this.model.isNew()) return 'Add'
  if (typeof this.model._organization() === 'string') return 'Edit'
  return 'Hello'
}

/**
 * Is Old?
 */

View.prototype.isEditing = function () {
  return !this.model.isNew()
}

/**
 * Email
 */

View.prototype.email = function () {
  return this.model._user().email || ''
}

/**
 * Back?
 */

View.prototype.back = function () {
  var m = this.model
  var org = m._organization()
  return m.isNew() ? '/manager/organizations/' + org + '/show' :
    '/manager/organizations/' + org + '/commuters/' + m._id() + '/show'
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

  // set the email address
  this.model._user({
    email: data.email
  })
  delete data.email

  // set the rest of the data
  this.model.set(data)

  var text = this.model.isNew() ? 'Added & invited new commuter.' : 'Saved changes to commuter.'

  var self = this
  this.model.save(function (err) {
    if (err) {
      Alert({
        type: 'danger',
        text: err
      })
    } else {
      alerts.push({
        type: 'success',
        text: text
      })
      page(self.back())
    }
  })
}
