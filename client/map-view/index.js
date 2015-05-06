var config = require('config')

var center = config.geocode().center.split(',').map(parseFloat)
var L = window.L

L.mapbox.accessToken = config.mapbox_access_token()

module.exports = function (el) {
  var map = L.mapbox.map(el, config.mapbox_map_id(), {
    attributionControl: {
      compact: true,
      position: 'bottomleft'
    },
    inertia: false,
    zoomAnimation: false
  }).setView([center[1], center[0]], config.geocode().zoom)

  return map
}
