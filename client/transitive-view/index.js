var config = require('config');
var d3 = require('d3');
var debounce = require('debounce');
var fmt = require('fmt');
var Location = require('location');
var log = require('log')('transitive-view');
var Transitive = require('transitive');
var view = require('view');

/**
 * Is mobile?
 */

var isMobile = window.innerWidth <= 480;

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {

  view.on('rendered', function() {
    var journey = model.journey();
    if (journey) view.display(journey);
  });

  model.on('change journey', function(journey) {
    if (journey) view.display(journey);
  });
});

/**
 * Expose `transitive` instance on view
 */

var transitive = View.transitive = window.transitive = new Transitive({
  displayMargins: {
    bottom: 43,
    right: 330,
    top: 43
  },
  draggableTypes: ['PLACE'],
  gridCellSize: 200,
  mapboxId: config.mapbox_map_id(),
  useDynamicRendering: true,
  styles: require('./style')
});

/**
 * Display
 */

View.prototype.display = function(journey) {
  log('--> displaying journey');

  var self = this;
  var el = this.el;
  var placeChanged = debounce(function(name, place) {
    self.placeChanged(name, place);
  }, 150, true);

  try {
    transitive.setElement(el);

    // Only render on non-mobile devices
    if (!isMobile) {
      transitive.updateData(journey);
      transitive.render();
    }

    transitive.on('place.from.dragend', function(place) {
      placeChanged('from', {
        lat: place.place_lat,
        lng: place.place_lon
      });
    });

    transitive.on('place.to.dragend', function(place) {
      placeChanged('to', {
        lat: place.place_lat,
        lng: place.place_lon
      });
    });

    log('<-- done displaying patterns');
  } catch (e) {
    log('<-- failed to display journey: %e', e);
    return;
  }
};

/**
 * Update place
 */

View.prototype.placeChanged = function(name, coordinate) {
  var plan = this.model;
  plan.setAddress(name, coordinate.lng + ',' + coordinate.lat, function(err, rees) {
    if (!err) plan.updateRoutes();
  });
};
