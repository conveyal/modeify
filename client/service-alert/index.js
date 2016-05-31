var model = require('component-model')

var config = require('../config')
var log = require('../log')('service-alert')
var request = require('../request')

/**
 * Expose `ServiceAlert`
 */

var ServiceAlert = module.exports = model('ServiceAlert')
  .use(require('../../components/trevorgerhardt/model-query/0.3.0'))
  .route(config.api_url() + '/service-alerts')
  .attr('_id')
  .attr('text')
  .attr('alert_url')
  .attr('fromDate')
  .attr('toDate')

ServiceAlert.load = function (ctx, next) {
  if (ctx.params.alert === 'new') return next()

  ServiceAlert.get(ctx.params.alert, function (err, alert) {
    if (err) {
      next(err)
    } else {
      ctx.alert = alert
      next()
    }
  })
}

ServiceAlert.loadAll = function (ctx, next) {
  ServiceAlert.all(function (err, alerts, res) {
    if (err || !res.ok) {
      next(err || res.text)
    } else {
      ctx.alerts = alerts
      next()
    }
  })
}
