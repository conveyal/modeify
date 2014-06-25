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
  var patterns = model.patterns();
  if (patterns && patterns.stops.length > 0) view.display(patterns);
  model.on('change patterns', function(patterns) {
    if (patterns) view.display(patterns);
  });
});

/**
 * Display
 */

View.prototype.display = function(patterns) {
  debug('--> displaying patterns');

  this.el.innerHTML = require('./legend.html');

  if (patterns.journeys && patterns.journeys.length > 0) {
    var transitive = window.transitive = new Transitive({
      el: this.el,
      legendEl: this.find('.legend'),
      data: patterns,
      gridCellSize: 200,
      mapboxId: config.mapbox_map_id(),
      useDynamicRendering: true,
      styles: require('./style')
    });
    transitive.render();
  }

  var el = this.el;
  this.find('.zoom.in').onclick = function() {
    var currentZoom = transitive.display.zoom.scale();
    transitive.display.zoom.center([ el.clientWidth, el.clientHeight ]);
    transitive.display.zoom.scale(currentZoom + 0.25);
    transitive.display.zoom.event(d3.select('.Transitive'));
    transitive.display.zoom.center(null);
  };

  this.find('.zoom.out').onclick = function() {
    var currentZoom = transitive.display.zoom.scale();
    transitive.display.zoom.center([ 0, 0 ]);
    transitive.display.zoom.scale(currentZoom - 0.25);
    transitive.display.zoom.event(d3.select('.Transitive'));
    transitive.display.zoom.center(null);
  };

  debug('<-- done displaying patterns');
};
