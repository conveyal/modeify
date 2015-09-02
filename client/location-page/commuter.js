var CommuterLocation = require('commuter-location')
var ConfirmModal = require('confirm-modal')
var view = require('view')

var View = module.exports = view(require('./commuter.html'))

View.prototype.organizationId = function () {
  return this.model._commuter._organization()
}

View.prototype.locationId = function () {
  return this.model._location._id()
}

View.prototype.commuterId = function () {
  return this.model._commuter._id()
}

View.prototype.status = function () {
  var commuter = this.model._commuter
  var status = commuter.status() || ' '
  var label = commuter.statusLabel() || 'default'
  return '<span class="label label-' + label + '">' + status + '</span>'
}

View.prototype.name = function () {
  var user = this.model._commuter.account()
  if (user && user.email) {
    return this.model._commuter.name() || user.email
  } else {
    return this.model._commuter.name()
  }
}

View.prototype.remove = function () {
  var self = this
  ConfirmModal({
    text: 'Are you sure want to delete this commuter?'
  }, function () {
    CommuterLocation.remove(self.model._id, function (err) {
      if (err) {
        console.error(err)
        window.alert(err)
      } else {
        self.el.remove()
      }
    })
  })
}

View.prototype.sendProfileAndMatches = function () {
  var name = this.model._commuter.name() || this.model._commuter.account().email
  CommuterLocation.sendProfileAndMatches(this.model._id, function (err) {
    if (err) {
      console.error(err)
      window.alert(err)
    } else {
      window.alert('Commute profile and plans have been sent to ' + name + '!')
    }
  })
}
