var config = require('config')
var log = require('log')('ridepool')
var map = require('map')
var model = require('model')
var request = require('request')

/**
 * Expose `Ridepool`
 */

var Ridepool = module.exports = model('Ridepool')
  .route(config.api_url() + '/ridepools')
  .attr('_id')
  .attr('created_by')
  .attr('name')
  .attr('type')
  .attr('visibility')
  .attr('from')
  .attr('to')

Ridepool.load = function (ctx, next) {
  if (ctx.params.ridepool === 'new') return next()

  Ridepool.get(ctx.params.ridepool, function (err, ridepool) {
    if (err) {
      next(err)
    } else {
      ctx.ridepool = ridepool
      next()
    }
  })
}

Ridepool.loadOrg = function (ctx, next) {
  log.info('ridepool loadOrg')
  request
    .get('/ridepools/created_by/' + ctx.params.organization, function (err, res) {
      if (err) {
        log.info('ridepool loadOrg err ' + err)
        next(err)
      } else {
        if(res.body) {
          log.info('load org found %s ridepools(s)', res.body.length)
          ctx.ridepools = res.body.map(function (l) {
            return new Ridepool(l)
          })
        }
        next()
      }
    })
}