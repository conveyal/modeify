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
  view.transitive = new Transitive(view.find('.map'), null, require('./style'), {
    gridCellSize: 800
  });
  var patterns = model.patterns();
  if (patterns && patterns.stops.length > 0) view.display(patterns);
  model.on('change patterns', function(patterns) {
    view.display(patterns);
  });
});

/**
 * Display
 */

View.prototype.display = function(patterns) {
  debug('displaying...');
  this.transitive.data = patterns;
  this.transitive.render();
};
