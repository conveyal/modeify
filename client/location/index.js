var config = require('config')
var model = require('model')

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
