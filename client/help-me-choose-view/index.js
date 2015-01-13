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
}, function(view) {

});

/**
 * Refresh
 */

Modal.prototype.refresh = function(e) {
  e && e.preventDefault();

  var primary, secondary, multiple;
  this.routes
};

/**
 * Append option
 */

Modal.prototype.renderRoute = function(route, multiple) {
  return routeTemplate.render({
    segments: routeSummarySegments(route)

  });
};
