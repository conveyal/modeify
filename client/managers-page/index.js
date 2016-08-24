var alerts = require('../alerts')
var log = require('../log')('managers-page')
var page = require('page')
var request = require('../request')
var session = require('../session')
var User = require('../user')
var view = require('../view')
var ConfirmModal = require('../confirm-modal')

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

      var sorter = function (a, b) {
        if (a.fullName() < b.fullName()) return -1
        if (a.fullName() > b.fullName()) return 1
        return 0
      }

      managers.sort(sorter).forEach(function (user) {
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
  var password = this.find('#password').value

  alerts.clear()
  User.createManager({
    email: email,
    givenName: givenName,
    surname: surname,
    password: password
  }, function (err, user) {
    if (err) {
      alerts.show({
        type: 'danger',
        text: err.message || err
      })
    } else {
      alerts.push({
        type: 'success',
        text: 'Invited ' + givenName + ' ' + surname + ' at ' + email + ' to be a new manager.'
      })
      page('/manager/managers')
    }
  })
}

/**
 * Reset password
 */

ManagerView.prototype.resetPassword = function (e) {
  if (window.confirm("Reset user's password?")) { // eslint-disable-line no-alert
    alerts.clear()
    request.post('/users/change-password-request', {
      email: this.model.email()
    }, function (err, res) {
      if (err || !res.ok) {
        log.error(err || res.error || res.text)
        alerts.show({
          type: 'danger',
          text: 'Failed to send reset password request.'
        })
      } else {
        alerts.show({
          type: 'success',
          text: 'Reset password request sent.'
        })
      }
    })
  }
}

/**
 * Delete User
 */

ManagerView.prototype.deleteUser = function (e) {
  var user = this.model
  ConfirmModal({
    text: `Are you sure want to delete the user ${user.fullName()} (${user.email()})?`
  }, function () {
    user.deleteUser(function (err) {
      if (err) {
        window.alert(err)
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted user.'
        })
        page('/manager/managers')
      }
    })
  })
}
