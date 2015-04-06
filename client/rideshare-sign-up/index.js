var Alert = require('./client/alert')
var CommuterProfile = require('commuter-profile')
var LocationsView = require('locations-view')
var log = require('log')('rideshare-sign-up')
var modal = require('modal')
var request = require('./client/request')
var session = require('session')

var ThanksModal = modal({
  closable: true,
  template: require('./thanks.html'),
  title: 'Thanks Modal'
})

ThanksModal.prototype.profile = function (e) {
  if (e) e.preventDefault()
  CommuterProfile({
    commuter: session.commuter(),
    plan: session.plan()
  }).show()
}

var SignUpModal = module.exports = modal({
  closable: true,
  template: require('./template.html'),
  title: 'Sign Up Modal'
})

SignUpModal.prototype.anonymous = function () {
  return session.commuter().anonymous()
}

SignUpModal.prototype.email = function () {
  if (!this.anonymous()) {
    return session.user().email()
  }
  return ''
}

SignUpModal.prototype.save = function (e) {
  e.preventDefault()
  log('submit')

  var alerts = this.find('.alerts')
  alerts.innerHTML = ''

  var email = this.find('input[name=email]').value
  var name = {
    first: this.find('input[name=first-name]').value,
    last: this.find('input[name=last-name]').value
  }
  var plan = session.plan()
  var commute = {
    origin: {
      address: plan.from(),
      coords: plan.from_ll()
    },
    destination: {
      address: plan.to(),
      coords: plan.to_ll()
    }
  }

  var button = this.find('button')
  var id = session.commuter()._id()

  if (!name.first || name.first.length < 1) {
    return alerts.appendChild(Alert({
      type: 'warning',
      text: 'Invalid first name.'
    }).el)
  }
  if (!name.last || name.last.length < 1) {
    return alerts.appendChild(Alert({
      type: 'warning',
      text: 'Invalid last name.'
    }).el)
  }
  if (!email || email.length < 1) {
    return alerts.appendChild(Alert({
      type: 'warning',
      text: 'Invalid email address.'
    }).el)
  }

  button.disabled = true
  request.post('/commuters/' + id + '/carpool-sign-up', {
    email: email,
    name: name,
    commute: commute
  }, function (err, res) {
    if (err) {
      var msg = res ? res.text : err
      button.disabled = false
      log.warn('%e %s', err)
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to sign up. ' + msg
      }).el)
    } else {
      session.commuter().set({
        anonymous: false
      }).save()
      ThanksModal().show()
    }
  })
}

SignUpModal.prototype.locationsView = function () {
  return new LocationsView(session.plan())
}
