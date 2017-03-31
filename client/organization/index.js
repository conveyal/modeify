var config = require('../config')
var defaults = require('../components/segmentio/model-defaults/0.2.0')
var log = require('../log')('organization')
var model = require('component-model')

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
  .use(require('../components/trevorgerhardt/model-query/0.3.0'))
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
    if (err) {
      log.error(err)
      next(err)
    } else {
      ctx.organization = org
      next()
    }
  })
}

Organization.loadAll = function (ctx, next) {
  Organization.all(function (err, orgs, res) {
    if (err || !res.ok) {
      next(err || res.text)
    } else {
      ctx.organizations = orgs
      next()
    }
  })
}
