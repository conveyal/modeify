var log = require('log')('welcome-flow:finding-options');
var modal = require('modal');
var RouteComparisonTable = require('route-comparison-table');
var RouteSummaryView = require('route-summary-view');

/**
 * Create `Modal`
 */

var FindingOptions = module.exports = modal({
  category: 'planner-welcome-flow',
  template: require('./template.html'),
  title: 'Finding Options Modal'
});

FindingOptions.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};

FindingOptions.prototype.routeComparisonTable = function() {
  return new RouteComparisonTable(this.model);
};

FindingOptions.prototype.routeSummaryView = function() {
  return new RouteSummaryView(this.model);
};
