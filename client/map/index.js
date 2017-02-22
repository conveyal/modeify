var config = require('../config')
var log = require('../log')('map')
var L = require('leaflet')
var page = require('page')

var center = config.geocode().center.split(',').map(parseFloat)

function constructMapboxUrl (tileset) {
  var mapboxAccessToken = config.mapbox_access_token()
  var isRetina = window.devicePixelRatio > 1 ? '@2x' : ''
  return `https://api.mapbox.com/styles/v1/${tileset}/tiles/256/{z}/{x}/{y}${isRetina}?access_token=${mapboxAccessToken}`
}

/**
 * Expose `map`
 */

module.exports = function (el, opts) {
  /* opts = opts || {}
  opts.tileLayer = opts.tileLayer || {
    detectRetina: true
  }

  // create a map in the el with given options
  return new Mapp(L.mapbox.map(el, config.mapbox_map_id(), opts)) */
  var ll = opts.center ? [opts.center.lat, opts.center.lng] : [center[1], center[0]]
  return new Mapp(L.map(el).setView(ll, config.geocode().zoom))
}

/**
 * Expose `createMarker`
 */

module.exports.createMarker = function (opts) {
  log('creating marker %s', opts)
  var marker = L.marker(new L.LatLng(opts.coordinate[1], opts.coordinate[0]), {
    icon: L.divIcon({
      html: `<i class="fa fa-${opts.icon}" aria-hidden="true" style="font-size: ${opts.size || 16}px; color: ${opts.color || '#000'}"></i>`,
      className: 'marker-icon'
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

function Mapp (map) {
  this.map = map
  L.tileLayer(constructMapboxUrl(config.mapbox_base_style_manager())).addTo(map)
  this.featureLayer = L.featureGroup().addTo(map)
}

/**
 * Add Marker
 */

Mapp.prototype.addMarker = function (marker) {
  this.featureLayer.addLayer(marker)
}

/**
 * Add Layer
 */

Mapp.prototype.addLayer = function (layer) {
  this.map.addLayer(layer)
}

/**
 * Fit bounds
 */

Mapp.prototype.fitLayer = function (layer) {
  log('fitting layer %s', layer)
  var map = this.map
  map.whenReady(function () {
    log('map ready')
    setTimeout(function () {
      var bounds = layer.getBounds()
      log('fitting to bounds %s', bounds)
      map.fitBounds(bounds)
    }, 200)
  })
}

/**
 * Fit to multiple layers
 */

Mapp.prototype.fitLayers = function (layers) {
  log('fitting to %s layers', layers.length)
  var map = this.map
  map.whenReady(function () {
    log('map ready')
    setTimeout(function () {
      var bounds = layers[0].getBounds()
      for (var i = 1; i < layers.length; i++) {
        bounds.extend(layers[i].getBounds())
      }
      map.fitBounds(bounds)
    }, 200)
  })
}
