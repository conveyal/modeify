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

Modal.prototype.fullName = function () {
  if(!this.model.user) return 'unknown'
  return this.model.user.fullName()
}

Modal.prototype.email = function () {
  if(!this.model.user) return 'unknown'
  return this.model.user.email()
}
