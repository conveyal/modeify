var fs = require('fs')
var Alert = require('../../alert')
var message = require('../../messages')('welcome-flow:locations')
var modal = require('../../modal')

var Locations = module.exports = modal({
  closable: true,
  logo: true,
  message: message,
  template: fs.readFileSync(__dirname + '/template.html')
}, function (view, model) {
  var plan = model.plan

  if (plan.validCoordinates()) {
    view.enableNext()
  } else {
    plan.on('change', function () {
      if (plan.validCoordinates()) {
        view.enableNext()
      }
    })

    var from = plan.from()
    var to = plan.to()
    if (from && to) plan.setAddresses(from, to)
  }
})

Locations.prototype.enableNext = function () {
  var button = this.find('.btn')
  button.classList.remove('disabled')
}

Locations.prototype.next = function (e) {
  e.preventDefault()
  var button = this.find('.btn')
  button.classList.add('loading')

  var alerts = this.find('.alerts')
  alerts.innerHTML = ''

  var plan = this.model.plan
  var self = this
  plan.updateRoutes({}, function (err, data) {
    if (err) {
      button.classList.remove('loading')
      button.classList.add('disabled')

      alerts.appendChild(Alert({
        type: 'danger',
        text: err
      }).el)
    } else {
      self.emit('next')
    }
  })
}

Locations.prototype.skip = function (e) {
  e.preventDefault()
  this.emit('skip')
}
