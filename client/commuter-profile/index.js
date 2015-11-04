var modal = require('./client/modal')
var page = require('page')
var session = require('session')
var SignUpForm = require('sign-up-form')

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
})

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
Modal.prototype.email = function () {
  return this.model.commuter.email()
}

/**
 * Journey Modal
 */

Modal.prototype['journeys-view'] = function () {
  return require('./journey')
}

/**
 * Has journeyrs
 */

Modal.prototype.hasJourneys = function () {
  return this.model.journeys && this.model.journeys.length() > 0
}
