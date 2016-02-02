var extend = require('extend')
var config = require('config')

var LocationSuggest = require('location-suggest')

var View = require('view')({
  category: 'create-link',
  template: require('./template.html'),
  title: 'Create Link'
})

View.prototype.applicationName = function () {
  return config.application()
}

View.prototype.generate = function () {
  var radios = document.getElementsByName('endpointType')
  var type
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      type = radios[i].value
      break
    }
  }

  var loc = this.find('#location').value
  var location = window.location
  var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/planner?' + type + '=' + encodeURIComponent(loc)

  this.find('#link').value = url
}

View.prototype.locationSelected = function () {}

extend(View.prototype, LocationSuggest.prototype)

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}
