var config = require('../config')
var page = require('page')
var view = require('../view')

var Nav = module.exports = view(require('./template.html'), function (view, model) {
  model.on('change', function () {
    model.emit('change isAdmin', model.isAdmin())
    model.emit('change isLoggedIn', model.isLoggedIn())
    model.emit('change isManager', model.isManager())
    model.emit('change username')
  })
})

Nav.prototype.application = function () {
  return config.name()
}

Nav.prototype.logout = function () {
  this.model.logout(function () {
    page('/manager')
  })
}

Nav.prototype.username = function () {
  if (!this.model.user()) return ''
  return this.model.user().email()
}
