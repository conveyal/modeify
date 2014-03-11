/**
 * Dependencies
 */

var Detailed = require('./detailed');
var Simple = require('./simple');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Set the routes view
 */

View.prototype['routes-view'] = function() {
  return this.RoutesView || Simple;
};

/**
 * Set View
 */

View.prototype.setView = function(namespace, view) {
  this.RoutesView = view;

  this.removeClass('graphical-options');
  this.removeClass('detailed-options');
  this.removeClass('simple-options');

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
 * Set Active
 */

View.prototype.simple = function() {
  this.setView('simple-options', Simple);
};

/**
 * Detailed
 */

View.prototype.detailed = function() {
  this.setView('detailed-options', Detailed);
};
