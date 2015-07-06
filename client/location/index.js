var config = require('config')
var log = require('log')('location')
var map = require('map')
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

Location.prototype.mapMarker = function () {
  var c = this.coordinate()
  return map.createMarker({
    title: '<a href="/manager/organizations/' + this.created_by() + '/locations/' + this._id() + 'show">' + this.name() + '</a>',
    description: this.fullAddress(),
    color: '#428bca',
    coordinate: [c.lng, c.lat],
    icon: 'commercial'
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

Location.prototype.profileAndMatch = function (callback) {
  request.get('/commuter-locations/profile-and-match', {
    _location: this._id()
  }, function (err, res) {
      if (err) {
        callback(err)
      } else {
        callback(null, res.text)
      }
    })
}
