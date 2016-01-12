var modal = require('./client/modal')
var page = require('page')
var session = require('session')
var SignUpForm = require('sign-up-form')
var view = require('view')
var debounce = require('debounce')
var config = require('config')

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
})

Modal.prototype.applicationName = function () {
  return config.application()
}

/**
 * Sign Up Form
 */

Modal.prototype.signUpForm = function () {
  return new SignUpForm()
}

/**
 * Log out
 */

Modal.prototype.logout = function (e) {
  if (e) e.preventDefault()
  this.hide()
  session.logout(function (err) {
    if (err) console.error(err)
    page('/')
  })
}

/**
 * Proxy values
 */

Modal.prototype.anonymous = function () {
  return this.model.commuter.anonymous()
}

Modal.prototype.fullName = function () {
  if(!this.model.user) return 'unknown'
  return this.model.user.fullName()
}

Modal.prototype.email = function () {
  if(!this.model.user) return 'unknown'
  return this.model.user.email()
}


Modal.prototype.places = function () {
  if(!this.model.user) return []
  return this.model.user.customData().modeify_places
}

Modal.prototype['places-view'] = function () {
  var self = this

  var PlaceRow = view(require('./place.html'))

  PlaceRow.prototype.setFrom = function () {
    placeChanged('from', this.model.address)
  }

  PlaceRow.prototype.setTo = function () {
    placeChanged('to', this.model.address)
  }

  PlaceRow.prototype.deletePlace = function () {
    session.user().deleteFavoritePlace(this.model.address)
    session.user().saveCustomData(function () {})
    this.el.remove()
  }

  return PlaceRow
}

var placeChanged = debounce(function (name, address) {
  var plan = session.plan()
  plan.setAddress(name, address, function (err, res) {
    if (err) console.error(err)
    else plan.updateRoutes()
  })
}, 150, true)