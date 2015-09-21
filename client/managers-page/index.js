var alerts = require('alerts')
var log = require('./client/log')('managers-page')
var page = require('page')
var request = require('./client/request')
var session = require('session')
var User = require('user')
var view = require('view')

/**
 * Create View
 */

var View = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Managers Page'
})
var ManagerView = view(require('./manager.html'))

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  ctx.view = new View()
  User.getManagers(function (err, managers) {
    if (err) {
      log.error(err)
      window.alert(err)
    } else {
      var tbody = ctx.view.find('tbody')
      managers.forEach(function (user) {
        if (user.email() === session.user().email()) return
        var view = new ManagerView(user)
        tbody.appendChild(view.el)
      })
    }
    next()
  })
}

/**
 * Create
 */

View.prototype.create = function (e) {
  e.preventDefault()
  var email = this.find('#email').value
  var givenName = this.find('#givenName').value
  var surname = this.find('#surname').value

  User.createManager({
    email: email,
    givenName: givenName,
    surname: surname
  }, function (err, user) {
    if (err) {
      log.error(err)
      window.alert('Failed to create manager.')
    } else {
      alerts.push({
        type: 'success',
        text: 'Invited ' + givenName + ' at ' + email + ' to be a new manager.'
      })
      page('/manager/managers')
    }
  })
}

/**
 * Delete
 */

ManagerView.prototype.destroy = function (e) {
  e.preventDefault()
  if (window.confirm('Delete this manager?')) { // eslint-disable-line no-alert
    this.model.destroy(function (err) {
      if (err) {
        log.error(err)
        window.alert('Failed to delete manager.') // eslint-disable-line no-alert
      } else {
        alerts.push({
          type: 'success',
          text: 'Created new manager.'
        })
        page('/manager/managers')
      }
    })
  }
}

/**
 * Reset password
 */

ManagerView.prototype.resetPassword = function (e) {
  if (window.confirm('Reset user\'s password?')) { // eslint-disable-line no-alert
    request.post('/users/change-password-request', {
      email: this.model.email()
    }, function (err, res) {
      if (err || !res.ok) {
        log.error(err || res.error || res.text)
        window.alert('Failed to send reset password request.') // eslint-disable-line no-alert
      } else {
        alerts.show({
          type: 'success',
          text: 'Reset password request sent.'
        })
      }
    })
  }
}
