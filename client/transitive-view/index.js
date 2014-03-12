/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':transitive-view');
var profiler = require('otpprofiler.js');
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
  debug('displaying...');
  var map = this.find('.map');
  map.innerHTML = '';
  var transitive = new Transitive(this.find('.map'), patterns, require(
    './style'), {
    gridCellSize: 800
  });
  transitive.render();
};
