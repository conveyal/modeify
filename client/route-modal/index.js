var log = require('log')('welcome-flow:finding-options');
var modal = require('modal');
var RouteComparisonTable = require('route-comparison-table');
var RouteSummaryView = require('route-summary-view');

/**
 * Create `Modal`
 */

var RouteModal = module.exports = modal({
  template: require('./template.html'),
  title: 'Selected Option Modal'
});

RouteModal.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};

RouteModal.prototype.routeComparisonTable = function() {
  return new RouteComparisonTable(this.model);
};

RouteModal.prototype.routeSummaryView = function() {
  return new RouteSummaryView(this.model);
};
