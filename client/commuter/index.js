var config = require('config')
var log = require('./client/log')('commuter')
var defaults = require('model-defaults')
var map = require('map')
var model = require('model')

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = model('Commuter')
  .use(defaults({
    anonymous: true,
    account: {},
    name: '',
    link: '',
    labels: [],
    opts: {},
    profile: {}
  }))
  .use(require('model-geo'))
  .use(require('model-query'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/commuters')
  .attr('_id')
  .attr('_location')
  .attr('_organization')
  .attr('account')
  .attr('anonymous')
  .attr('name')
  .attr('link')
  .attr('labels')
  .attr('opts')
  .attr('profile')
  .attr('status')

/**
 * Load middleware
 */

Commuter.load = function (ctx, next) {
  if (ctx.params.commuter === 'new') return next()

  Commuter.get(ctx.params.commuter, function (err, commuter) {
    if (err) {
      next(err)
    } else {
      ctx.commuter = commuter
      next()
    }
  })
}

/**
 * Load all commuters for an org middleware
 */

Commuter.loadOrg = function (ctx, next) {
  if (ctx.params.organization === 'new') return next()

  Commuter.query({
    _organization: ctx.params.organization
  }, function (err, commuters, res) {
    if (err || !res.ok) {
      log.error('%e', err || res.error)
      next(err || new Error(res.text))
    } else {
      ctx.commuters = commuters
      next()
    }
  })
}

/**
 * Return map marker opts
 */

Commuter.prototype.mapMarker = function () {
  var c = this.fuzzyCoordinate()

  return map.createMarker({
    title: 'Approx. location of ' + this.account().email,
    description: '<a href="/manage/organizations/' + this._organization() + '/commuters/' + this._id() + '/show">' + this.fuzzyAddress() + '</a>',
    color: '#5cb85c',
    coordinate: [c.lng, c.lat],
    icon: 'building',
    size: 'small'
  })
}

/**
 * Status Label
 */

Commuter.prototype.statusLabel = function () {
  switch (this.status()) {
    case 'sent':
      return 'default'
    case 'opened':
      return 'warning'
    case 'clicked':
      return 'success'
  }
}

/**
 * Update profile
 */

Commuter.prototype.updateProfile = function (name, val) {
  var profile = this.profile()
  profile[name] = val
  this.profile(profile)
}
