var config = require('config')
var page = require('page')
var view = require('view')

var Nav = module.exports = view(require('./template.html'), function (view, model) {
  model.on('change', function () {
    model.emit('change isAdmin', model.isAdmin())
    model.emit('change isLoggedIn', model.isLoggedIn())
    model.emit('change isManager', model.isManager())
  })
})

Nav.prototype.application = function () {
  return config.application()
}

Nav.prototype.logout = function () {
  this.model.logout(function () {
    page('/manager')
  })
}
