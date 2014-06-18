var Detailed = require('./detailed');
var Graphical = require('./graphical');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Set the routes view
 */

View.prototype['routes-view'] = function() {
  return this.RoutesView || Graphical;
};

/**
 * Set View
 */

View.prototype.setView = function(namespace, view) {
  this.RoutesView = view;

  this.removeClass('graphical-options');
  this.removeClass('detailed-options');

  var self = this;
  this.model.updateRoutes(function() {
    self.addClass(namespace);
  });
};

/**
 * Graphical
 */

View.prototype.graphical = function() {
  this.setView('graphical-options', require('./graphical'));
};

/**
 * Detailed
 */

View.prototype.detailed = function() {
  this.setView('detailed-options', Detailed);
};
