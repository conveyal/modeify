var L = require('mapbox.js')
require('leaflet-markercluster')

var config = require('../config')
var log = require('../log')('organization-page')
var map = require('../map')
var View = require('./view')

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('attach view')

  // create lookup table mapping location IDs -> names
  ctx.organization.locations = ctx.locations
  var locationNames = {}
  ctx.locations.forEach(function (location) {
    locationNames[location.get('_id')] = location.get('name') || (location.get('address') + ', ' + location.get('city'))
  })

  ctx.organization.ridepools = ctx.ridepools.map(function (ridepool) {
    ridepool.from_name = locationNames[ridepool.get('from')]
    ridepool.to_name = locationNames[ridepool.get('to')]
    return ridepool
  })

  ctx.view = window.view = new View(ctx.organization)
  ctx.view.on('rendered', function () {
    var center = ctx.locations && ctx.locations.length > 0
      ? ctx.locations[0].coordinate()
      : config.geocode().center.split(',').map(parseFloat)

    if (!center.lat) {
      center = {
        lat: center[1],
        lng: center[0]
      }
    }

    var m = map(ctx.view.find('.map'), {
      center: center,
      zoom: 13
    })

    var cluster = new L.MarkerClusterGroup()
    ctx.locations.forEach(function (l) {
      cluster.addLayer(l.mapMarker())
    })

    m.addLayer(cluster)

    if (ctx.locations.length > 0) {
      m.fitLayers([m.featureLayer, cluster])
    }
  })

  next()
}
