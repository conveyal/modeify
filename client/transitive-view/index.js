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
  var zoomIn = this.find('.zoom.in');
  var zoomOut = this.find('.zoom.out');

  try {
    transitive.setElement(el);
    transitive.updateData(journey);
    transitive.render();

    transitive.on('place.from.dragend', function(place) {
      placeChanged('from', place);
    });

    transitive.on('place.to.dragend', function(place) {
      placeChanged('to', place);
    });

    if (zoomIn) {
      zoomIn.onclick = function() {
        el.dispatchEvent(new window.WheelEvent('wheel', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: el.clientWidth / 2,
          clientY: el.clientHeight * 0.7,
          deltaY: -300
        }));
      };
    }

    if (zoomOut) {
      zoomOut.onclick = function() {
        el.dispatchEvent(new window.WheelEvent('wheel', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: el.clientWidth / 2,
          clientY: el.clientHeight * 0.7,
          deltaY: 300
        }));
      };
    }

    log('<-- done displaying patterns');
  } catch (e) {
    log('<-- failed to display journey: %e', e);
    return;
  }
};

/**
 * Update place
 */

View.prototype.placeChanged = function(name, place) {
  var plan = this.model;
  var location = new Location({
    coordinate: {
      lat: place.place_lat,
      lng: place.place_lon
    }
  });

  location.save(function(err, res) {
    var changes = {};

    if (err) {
      changes[name] = 'Address not found';
      changes[name + '_ll'] = {
        lat: place.place_lat,
        lng: place.place_lon
      };
      changes[name + '_valid'] = false;
    } else {
      var loc = res.body;
      changes[name] = fmt('%s, %s, %s %s', loc.address, loc.city, loc.state, loc.zip);
      changes[name + '_ll'] = {
        lat: place.place_lat,
        lng: place.place_lon
      };
      changes[name + '_id'] = loc._id;
      changes[name + '_valid'] = true;
    }

    plan.set(changes);
    plan.updateRoutes();
  });
};
