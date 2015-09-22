var reactiveSelect = require('reactive-select')
var template = require('./template.html')
var view = require('view')

var View = module.exports = view(template, function (view, plan) {
  view.reactive.use(reactiveSelect)
  view.on('active', function () {
    plan.updateRoutes()
  })
  view.on('selected', function () {
    plan.updateRoutes()
  })
})

var times = hourOptions()

View.prototype.startTimes = function () {
  return times.slice(0, -1)
}

View.prototype.endTimes = function () {
  return times.slice(1)
}

View.prototype.parseInt = parseInt

function hourOptions () {
  var times = []
  for (var i = 0; i <= 24; i++) {
    times.push(toOption(i))
  }
  return times
}

function toOption (n) {
  var opt = {
    name: '',
    value: n
  }

  if (n > 23 || n === 0) opt.name = 'Midnight'
  else if (n > 12) opt.name = n - 12 + ':00 pm'
  else if (n === 12) opt.name = 'Noon'
  else opt.name = n + ':00 am'

  return opt
}

View.prototype.showSettings = function () {
  // this.el = document.querySelector('.FilterView')

  // this.find = this.el.querySelector('')
  
  var settingsFormElement = this.find('.settings-form')

  settingsFormElement.classList.add('settings-form-open')
  settingsFormElement.classList.add('settings-form-open')

}

View.prototype.hideSettings = function () {
  this.find('.settings-form').classList.remove('settings-form-open')
}




