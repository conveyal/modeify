var hogan = require('hogan.js');
var modal = require('modal');
var routeSummarySegments = require('route-summary-segments');

var routeTemplate = hogan.compile(require('./route.html'));

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
}, function(view, routes) {
  view.refresh();
});

/**
 * Refresh
 */

Modal.prototype.refresh = function(e) {
  e && e.preventDefault();

  // Routes
  var routes = this.model;

  // Remove existing rows
  var tbody = this.find('tbody');
  tbody.innerHTML = '';

  // Get the indexes
  var primary, secondary, multiple;

  // Sort
  routes.sort(function() {

  });

  // Render
  for (var i = 0; i < routes.length; i++) {
    tbody.innerHTML += this.renderRoute(routes[i], multiple);
  }
};

/**
 * Append option
 */

Modal.prototype.renderRoute = function(route, multiple) {
  return routeTemplate.render({
    segments: routeSummarySegments(route, {
      inline: true
    }),
    time: route.time(),
    frequency: route.frequency(),
    cost: route.cost(),
    walkTime: route.walkTime(),
    calories: route.calories(),
    productiveTime: 0,
    emissions: route.emissions()
  });
};
