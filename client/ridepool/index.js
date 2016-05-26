var config = require('../config')
var log = require('../log')('ridepool')
var model = require('component-model')
var request = require('../request')

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
        if (res.body) {
          log.info('load org found %s ridepools(s)', res.body.length)
          ctx.ridepools = res.body.map(function (l) {
            return new Ridepool(l)
          })
        }
        next()
      }
    })
}

Ridepool.forLocation = function (_location, callback) {
  log('loading ridepools for location %s', _location)
  request.get('/ridepools/by-location/' + _location, function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, (res.body || []).map(function (rp) {
        return new Ridepool(rp)
      }))
    }
  })
}
