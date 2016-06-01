var Alert = require('../alert')
var alerts = require('../alerts')
var Commuter = require('../commuter')
var config = require('../config')
var debug = require('debug')(config.name() + ':commuter-form')
var page = require('page')
var serialize = require('../../components/trevorgerhardt/serialize/0.0.1')
var view = require('../view')
var LocationSuggest = require('../location-suggest')
var extend = require('../../components/segmentio/extend/1.0.0')
var geocode = require('../geocode')

/**
 * Create `View`
 */

var View = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Commuter Form'
})

extend(View.prototype, LocationSuggest.prototype)

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  debug('render')

  if (ctx.commuter) {
    ctx.view = new View(ctx.commuter, {
      location: ctx.location,
      organization: ctx.organization
    })
    ctx.view.organization = ctx.organization
  } else {
    ctx.view = new View(new Commuter({
      _organization: ctx.params.organization
    }), {
      location: ctx.location,
      organization: ctx.organization
    })
  }

  next()
}

View.prototype.locationSelected = function (target, address) {
  document.getElementById('address').value = address.split(',')[0]
  geocode.extended(address, function (err, res) {
    if (err) console.error(err)

    if (res.city) document.getElementById('city').value = res.city
    if (res.state) document.getElementById('state').value = res.state
    if (res.zip) document.getElementById('zip').value = res.zip
  })
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
 * Back?
 */

View.prototype.back = function () {
  var m = this.model
  var org = m._organization()
  return m.isNew()
    ? '/manager/organizations/' + org + '/locations/' + this.options.location._id() + '/show'
    : '/manager/organizations/' + org + '/locations/' + this.options.location._id() + '/show'
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

  if (this.options.location) {
    data._location = this.options.location._id()
  }

  data.zip = parseInt(data.zip, 10)

  // set the rest of the data
  this.model.set(data)

  var text = this.model.isNew() ? 'Added new commuter.' : 'Saved changes to commuter.'

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

      // refresh the profiles/matches for this location
      self.options.location.profileAndMatch(function () {
        page(self.back())
      })
    }
  })
}
