var log = require('./client/log')('organization-page')
var map = require('map')
var View = require('./view')

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('attach view')

  // create lookup table mapping location IDs -> names
  ctx.organization.locations = ctx.locations
  var locationNames = {}
  ctx.locations.forEach(function(location) {
    locationNames[location.get('_id')] = location.get('name') || (location.get('address') + ', ' + location.get('city'))
  })

  ctx.organization.ridepools = ctx.ridepools.map(function(ridepool){
    var fromId = ridepool.get('from'), toId = ridepool.get('to')
    ridepool.from_name = locationNames[ridepool.get('from')]
    ridepool.to_name = locationNames[ridepool.get('to')]
    return ridepool
  })

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
