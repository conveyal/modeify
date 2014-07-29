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
    transitive.display.zoom.scale(currentZoom * 1.25);
    transitive.display.zoom.event(d3.select('.Transitive'));
  };

  this.find('.zoom.out').onclick = function() {
    var currentZoom = transitive.display.zoom.scale();
    transitive.display.zoom.scale(currentZoom * 0.75);
    transitive.display.zoom.event(d3.select('.Transitive'));
  };

  debug('<-- done displaying patterns');
};

/*
  ART green #55b848
  Maryland green #2c9f4b
  Montgomery blue #355997
  Potomac blue #5398a0
  Fairfax yellow #faff4c
  Fairfax yellow type #c9b80d
  VRE red #de003a
  VRE blue #255393

  Metrobus #173964
  CaBI #d02228
  Metro Red #e21836
  Metro Orange #f7931d
  Metro Silver #a0a2a0
  Metro Blue #0076bf
  Metro Yellow #ffd200
  Metro Green #00a84f
*/
