var config = require('config')
var log = require('log')('location')
var model = require('model')
var request = require('request')

/**
 * Expose `Location`
 */

var Location = module.exports = model('Location')
  .use(require('model-geo'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/locations')
  .attr('_id')
  .attr('category')
  .attr('created_by')
  .attr('name')

Location.load = function (ctx, next) {
  if (ctx.params.location === 'new') return next()

  Location.get(ctx.params.location, function (err, location) {
    if (err) {
      next(err)
    } else {
      ctx.location = location
      next()
    }
  })
}

Location.loadOrg = function (ctx, next) {
  request
    .get('/locations/created_by/' + ctx.params.organization, function (err, res) {
      if (err) {
        next(err)
      } else {
        log('load org found %s location(s)', res.body.length)
        ctx.locations = res.body.map(function (l) {
          return new Location(l)
        })
        next()
      }
    })
}
