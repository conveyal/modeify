var Pikaday = require('pikaday')
var moment = require('moment')
var page = require('page')

var serialize = require('../../components/trevorgerhardt/serialize/0.0.1')
var alerts = require('../alerts') // onscreen notifications
var view = require('../view')
var ServiceAlert = require('../service-alert')
var ConfirmModal = require('../confirm-modal')

var AlertRow = require('./row')

var displayFormat = 'MM-DD-YYYY'

var View = view(require('./template.html'), function (view, model) {
  var defaultFromDate = moment()
  var defaultToDate = moment().add(1, 'days')

  var fromDateInput = view.find('.fromDate')
  view.fromDatePicker = new Pikaday({
    field: fromDateInput,
    defaultDate: defaultFromDate.toDate(),
    setDefaultDate: defaultFromDate.toDate(),
    format: displayFormat
  })

  var toDateInput = view.find('.toDate')
  view.toDatePicker = new Pikaday({
    field: toDateInput,
    defaultDate: defaultToDate.toDate(),
    setDefaultDate: defaultToDate.toDate(),
    format: displayFormat
  })
})

View.prototype.save = function (e) {
  var serviceAlert = new ServiceAlert()
  serviceAlert.set(serialize(this.el))
  var text = serviceAlert.isNew() ? 'Created new alert.' : 'Saved changes to alert.'
  serviceAlert.save(function (err) {
    if (err) {
      alerts.show({
        type: 'danger',
        text: err
      })
    } else {
      alerts.push({
        type: 'success',
        text: text
      })
      page('/manager/alerts')
    }
  })
}

View.prototype.delete = function (e) {
  this.model.alerts.forEach(function (alert) {
    if (alert.get('_id') === e.target.attributes['data-id'].value) {
      ConfirmModal({
        text: 'Are you sure want to delete this alert?'
      }, function () {
        alert.destroy(function (err) {
          if (err) {
            window.alert(err)
          } else {
            alerts.push({
              type: 'success',
              text: 'Deleted alert.'
            })
            page('/manager/alerts')
          }
        })
      })
    }
  })
}

View.prototype['alerts-view'] = function () {
  return AlertRow
}

module.exports = function (ctx, next) {
  ctx.view = new View({
    alerts: ctx.alerts
  })
  next()
}
