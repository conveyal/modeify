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
    el.dispatchEvent(new WheelEvent('wheel', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: el.clientWidth / 2,
      clientY: el.clientHeight * 0.7,
      deltaY: -300
    }));
  };

  this.find('.zoom.out').onclick = function() {
    el.dispatchEvent(new WheelEvent('wheel', {
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
