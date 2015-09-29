var debounce = require('debounce')
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

View.prototype.bikeSpeeds = function () {
  return [4, 6, 10].map(function (s) {
    return {
      name: s + ' mph',
      value: s
    }
  })
}

View.prototype.walkSpeeds = function () {
  return [2, 3, 4].map(function (s) {
    return {
      name: s + ' mph&nbsp;&nbsp;',
      value: s
    }
  })
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
  this.find('.ExpandedSettings').classList.add('open')
}

View.prototype.hideSettings = function () {
  this.find('.ExpandedSettings').classList.remove('open')
}

View.prototype.save = debounce(function (e) {
  var names = ['maxBikeTime', 'maxWalkTime', 'carParkingCost', 'carCostPerMile']
  var self = this
  var values = {}
  names.forEach(function (n) {
    values[n] = parseFloat(self.find('input[name=' + n + ']').value)
  })
  var scorer = this.model.scorer()
  scorer.rates.carParkingCost = values.carParkingCost
  scorer.rates.mileageRate = values.carCostPerMile
  this.model.set(values)
  this.model.updateRoutes()
}, 1000)
