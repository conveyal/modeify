var config = require('config');
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

  this.el.innerHTML = '';
  var transitive = window.transitive = new Transitive({
    el: this.el,
    data: patterns,
    style: require('./style'),
    gridCellSize: localStorage.getItem('gridCellSize') || 800
  });
  transitive.render();

  debug('<-- done displaying patterns');
};
