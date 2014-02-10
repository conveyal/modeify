/**
 * Leaflet
 */

// var L = window.L;

/**
 * Mapbox ID
 */

var ID = 'conveyal.h5bghhkn';

/**
 * Expose `map`
 */

module.exports = function(el, opts) {
  opts = opts || {};
  opts.tileLayer = opts.tileLayer || {
    detectRetina: true
  };

  // create a map in the el with given options
  var map = L.mapbox.map(el, ID, opts);

  return map;
};

/**
 * Add marker
 */

module.exports.add = function(layer, opts) {
  var json = layer.getGeoJSON();
  if (!json) {
    json = {
      features: [],
      id: ID,
      type: 'FeatureCollection'
    };
  }

  json.features.push(featureify(opts));
  layer.setGeoJSON(json);
};

/**
 * Add markers
 */

module.exports.addMarkers = function(layer, markers) {

};

function featureify(opts) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: opts.coordinate
    },
    properties: {
      title: opts.title || '',
      description: opts.description || '',
      'marker-size': opts.size || 'medium',
      'marker-color': opts.color || '#ccc',
      'marker-symbol': opts.icon || ''
    }
  };
}
