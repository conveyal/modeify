var log = require('./client/log')('organization-page')
var map = require('map')
var View = require('./view')

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('attach view')

  ctx.organization.locations = ctx.locations
  ctx.organization.ridepools = ctx.ridepools

  ctx.view = window.view = new View(ctx.organization)
  ctx.view.on('rendered', function () {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    })

    var cluster = new window.L.MarkerClusterGroup()
    ctx.locations.forEach(function (l) {
      cluster.addLayer(l.mapMarker())
    })

    m.addLayer(cluster)
    m.fitLayers([m.featureLayer, cluster])
  })

  next()
}
