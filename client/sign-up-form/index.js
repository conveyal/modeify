const auth0 = require('../auth0')
var config = require('../config')
var session = require('../session')
var view = require('../view')

var View = module.exports = view(require('./template.html'))

View.prototype.applicationName = function () {
  return config.name()
}

View.prototype.anonymous = function () {
  return session.commuter().anonymous()
}

View.prototype.login = function () {
  auth0.show()
}

View.prototype.showButton = function (e) {
  this.find('.SignUpForm-submitButton').classList.remove('hidden')
}

View.prototype.signUp = function () {
  auth0.show()
}
