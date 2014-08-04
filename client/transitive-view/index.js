var config = require('config');
var d3 = require('d3');
var debug = require('debug')(config.name() + ':transitive-view');
var each = require('each');
var Transitive = require('transitive');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  var journey = model.journey();
  if (journey && journey.stops.length > 0) view.display(journey);
  model.on('change journey', function(journey) {
    if (journey) view.display(journey);
  });
});

/**
 * Display
 */

View.prototype.display = function(journey) {
  debug('--> displaying journey');

  this.el.innerHTML = require('./legend.html');

  if (journey.journeys && journey.journeys.length > 0) {
    var transitive = window.transitive = new Transitive({
      el: this.el,
      legendEl: this.find('.legend'),
      data: journey,
      gridCellSize: 200,
      mapboxId: config.mapbox_map_id(),
      useDynamicRendering: true,
      styles: require('./style')
    });
    transitive.render();
  }

  var el = this.el;
  this.find('.zoom.in').onclick = function() {
    el.dispatchEvent(new window.WheelEvent('wheel', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: el.clientWidth / 2,
      clientY: el.clientHeight * 0.7,
      deltaY: -300
    }));
  };

  this.find('.zoom.out').onclick = function() {
    el.dispatchEvent(new window.WheelEvent('wheel', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: el.clientWidth / 2,
      clientY: el.clientHeight * 0.7,
      deltaY: 300
    }));
  };

  debug('<-- done displaying patterns');
};
