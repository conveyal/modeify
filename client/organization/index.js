var config = require('config')
var defaults = require('model-defaults')
var log = require('./client/log')('organization')
var model = require('model')

/**
 * Expose `Organization`
 */

var Organization = module.exports = model('Organization')
  .use(defaults({
    name: '',
    contact: '',
    email: '',
    labels: []
  }))
  .use(require('model-query'))
  .route(config.api_url() + '/organizations')
  .attr('_id')
  .attr('name')
  .attr('contact')
  .attr('email')
  .attr('main_url')
  .attr('logo_url')
  .attr('labels')

/**
 * Load middleware
 */

Organization.load = function (ctx, next) {
  if (ctx.params.organization === 'new') return next()

  log('loading %s', ctx.params.organization)
  Organization.get(ctx.params.organization, function (err, org) {
    console.log(err)
    console.log(org)

    if (err) {
      next(err)
    } else {
      ctx.organization = org
      next()
    }
  })
}
