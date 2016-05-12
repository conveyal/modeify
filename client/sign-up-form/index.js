var fs = require('fs')

var config = require('../config')
var session = require('../session')
var view = require('../view')

require('./style.css')

var View = module.exports = view(fs.readFileSync(__dirname + '/template.html'))

View.prototype.applicationName = function () {
  return config.name()
}

View.prototype.anonymous = function () {
  return session.commuter().anonymous()
}

View.prototype.showButton = function (e) {
  this.find('.SignUpForm-submitButton').classList.remove('hidden')
}
