var config = require('config')
var debug = require('debug')(config.name() + ':map')
var page = require('page')

var L = window.L

/**
 * Expose `map`
 */

module.exports = function (el, opts) {
  opts = opts || {}
  opts.tileLayer = opts.tileLayer || {
      detectRetina: true
    }

  // create a map in the el with given options
  return new Map(L.mapbox.map(el, config.mapbox_map_id(), opts))
}

/**
 * Expose `createMarker`
 */

module.exports.createMarker = function (opts) {
  debug('creating marker %s', opts)

  var marker = L.marker(new L.LatLng(opts.coordinate[1], opts.coordinate[0]), {
    icon: L.mapbox.marker.icon({
      'marker-size': opts.size || 'medium',
      'marker-color': opts.color || '#ccc',
      'marker-symbol': opts.icon || ''
    }),
    title: opts.title || ''
  })
  if (opts.url) {
    marker.on('click', function () {
      page(opts.url)
    })
  }
  return marker
}

/**
 * Map
 */

function Map (map) {
  this.map = map
  this.featureLayer = L.mapbox.featureLayer().addTo(map)
}

/**
 * Add Marker
 */

Map.prototype.addMarker = function (marker) {
  this.featureLayer.addLayer(marker)
}

/**
 * Add Layer
 */

Map.prototype.addLayer = function (layer) {
  this.map.addLayer(layer)
}

/**
 * Fit bounds
 */

Map.prototype.fitLayer = function (layer) {
  debug('fitting layer %s', layer)
  var map = this.map
  map.whenReady(function () {
    debug('map ready')
    setTimeout(function () {
      var bounds = layer.getBounds()
      debug('fitting to bounds %s', bounds)
      map.fitBounds(bounds)
    }, 200)
  })
}

/**
 * Fit to multiple layers
 */

Map.prototype.fitLayers = function (layers) {
  debug('fitting to %s layers', layers.length)
  var map = this.map
  map.whenReady(function () {
    debug('map ready')
    setTimeout(function () {
      var bounds = layers[0].getBounds()
      for (var i = 1; i < layers.length; i++) {
        bounds.extend(layers[i].getBounds())
      }
      map.fitBounds(bounds)
    }, 200)
  })
}
