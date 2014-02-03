/**
 * Leaflet
 */

var L = window.L;

/**
 * Expose `map`
 */

module.exports = function(el, opts) {
  opts = opts || {};
  opts.tileLayer = opts.tileLayer || {
    detectRetina: true
  };

  // create a map in the el with given options
  var map = window.map = L.mapbox.map(el, 'conveyal.h5bghhkn', opts);

  return map;
};

/**
 * Add marker
 */

module.exports.add = function(map, opts) {
  L.mapbox.markerLayer({
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
  }).addTo(map);
};
