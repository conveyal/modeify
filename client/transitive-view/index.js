var config = require('config');
var d3 = require('d3');
var fmt = require('fmt');
var Location = require('location');
var log = require('log')('transitive-view');
var throttle = require('throttle');
var Transitive = require('transitive');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  view.on('rendered', function() {
    var journey = model.journey();
    if (journey) view.display(journey);
  });

  model.on('change journey', function(journey) {
    if (journey) view.display(journey);
  });
});

/**
 * Display
 */

View.prototype.display = function(journey) {
  log('--> displaying journey');
  var self = this;
  var el = this.el;

  if (journey.journeys && journey.journeys.length > 0) {
    el.innerHTML = require('./legend.html');

    var legend = this.find('.legend');
    var zoomIn = this.find('.zoom.in');
    var zoomOut = this.find('.zoom.out');

    try {
      var transitive = window.transitive = new Transitive({
        displayMargins: {
          bottom: 43,
          right: 330,
          top: 43
        },
        draggableTypes: ['PLACE'],
        el: el,
        legendEl: legend,
        data: journey,
        gridCellSize: 200,
        mapboxId: config.mapbox_map_id(),
        useDynamicRendering: true,
        styles: require('./style')
      });
      transitive.render();

      transitive.on('place.from.dragend', function(place) {
        throttle(function() {
          self.placeChanged('from', place);
        }, 250);
      });

      transitive.on('place.to.dragend', function(place) {
        throttle(function() {
          self.placeChanged('to', place);
        }, 250);
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
    if (err) {
      log('%e', err);
    } else {
      var changes = {};
      var loc = res.body;
      changes[name] = fmt('%s, %s, %s %s', loc.address, loc.city, loc.state, loc.zip);
      changes[name + '_ll'] = {
        lat: place.place_lat,
        lng: place.place_lon
      };
      changes[name + '_id'] = loc._id;
      changes[name + '_valid'] = true;
      plan.set(changes);
      plan.updateRoutes();
    }
  });
};
