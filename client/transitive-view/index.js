var config = require('config');
var d3 = require('d3');
var log = require('log')('transitive-view');
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
  debug('--> displaying journey');

  if (journey.journeys && journey.journeys.length > 0) {
    this.el.innerHTML = require('./legend.html');

    try {
      var transitive = window.transitive = new Transitive({
        displayMargins: {
          bottom: 43,
          right: 330,
          top: 43
        },
        el: this.el,
        legendEl: this.find('.legend'),
        data: journey,
        gridCellSize: 200,
        mapboxId: config.mapbox_map_id(),
        useDynamicRendering: true,
        styles: require('./style')
      });
      transitive.render();
    } catch (e) {
      debug('<-- failed to display journey: %s', e.message);
      console.error(e.stack);
      return;
    }
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
