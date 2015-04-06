var log = require('./client/log')('forgot-password-page')
var page = require('page')
var request = require('./client/request')
var value = require('value')
var create = require('view')

/**
 * Create view
 */

var View = create(require('./template.html'))

/**
 * Send password change request
 */

View.prototype.sendChangeRequest = function (e) {
  e.preventDefault()
  var email = value(this.find('#email'))
  var self = this
  request.post('/users/change-password-request', {
    email: email
  }, function (err, res) {
    if (err) {
      log('%e', err || res.error || res.text)
      window.alert(err || res.text || 'Failed to send change password request.') // eslint-disable-line no-alert
    } else {
      window.alert('Check your inbox for instructions to change your password.') // eslint-disable-line no-alert
      page(self.back())
    }
  })
}

/**
 * Back
 */

View.prototype.back = function () {
  if (this.model.manager) return '/manager/login'
  return '/login'
}

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  ctx.view = new View({
    manager: ctx.manager
  })
  next()
}
