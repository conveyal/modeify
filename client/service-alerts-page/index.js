var Pikaday = require('pikaday')
var moment = require('moment')
var page = require('page')

var serialize = require('../../components/trevorgerhardt/serialize/0.0.1')
var request = require('../request')
var alerts = require('../alerts') // onscreen notifications
var textModal = require('../text-modal')
var view = require('../view')
var ServiceAlert = require ('../service-alert')

var AlertRow = require('./row')

var displayFormat = 'MM-DD-YYYY'

var View = view(require('./template.html'), function(view, model) {

  var defaultFromDate = moment()
  var defaultToDate = moment().add(1, 'days')

  var fromDateInput = view.find('.fromDate')
  view.fromDatePicker = new Pikaday({
    field: fromDateInput,
    defaultDate: defaultFromDate.toDate(),
    setDefaultDate: defaultFromDate.toDate(),
    format: displayFormat,
    onSelect: function() {
      view.updateRange()
    }
  });

  var toDateInput = view.find('.toDate')
  view.toDatePicker = new Pikaday({
    field: toDateInput,
    defaultDate: defaultToDate.toDate(),
    setDefaultDate: defaultToDate.toDate(),
    format: displayFormat,
    onSelect: function() {
      view.updateRange()
    }
  });
})

View.prototype.save = function (e) {
  console.log('save alert', serialize(this.el))

  var serviceAlert = new ServiceAlert()
  serviceAlert.set(serialize(this.el))
  //this.model.created_by(this.options.organization._id())
  var text = serviceAlert.isNew() ? 'Created new alert.' : 'Saved changes to alert.'
  var self = this
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
  console.log('delete alert', e.target.attributes['data-id'].value)
  this.model.alerts.forEach(function(alert) {
    if(alert.get('_id') === e.target.attributes['data-id'].value) {
      if (window.confirm('Delete alert?')) {
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
      }
    }
  })
}

View.prototype.formatFromDate = function (e) {
  console.log('formatFromDate', e);
}

View.prototype['alerts-view'] = function () {
  return AlertRow
}

module.exports = function (ctx, next) {
  console.log("ALERTS: ",ctx.alerts);
  ctx.view = new View({
    alerts: ctx.alerts
  })
  next()
}
