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

RouteModal.prototype.routeIntroText = function() {
  switch(this.options.context) {
    case 'welcome-flow': return 'Your best option is to';
    case 'option': return 'You selected';
  }
};

RouteModal.prototype.nextButtonText = function() {
  switch(this.options.context) {
    case 'welcome-flow': return 'Show all of my options';
    case 'option': return 'Return to my options';
  }
};