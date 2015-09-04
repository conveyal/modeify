var config = require('config')
var defaults = require('model-defaults')
var log = require('./client/log')('organization')
var map = require('map')
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
  .use(require('model-geo'))
  .use(require('model-memoize'))
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
    if (err) {
      next(err)
    } else {
      ctx.organization = org
      next()
    }
  })
}

/**
 * Return map marker opts
 */

Organization.prototype.mapMarker = function () {
  var c = this.coordinate()
  return map.createMarker({
    title: '<a href="/manager/organizations/' + this._id() + '/show">' + this.name() + '</a>',
    description: this.fullAddress(),
    color: '#428bca',
    coordinate: [c.lng, c.lat],
    icon: 'commercial'
  })
}
