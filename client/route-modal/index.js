var analytics = require('./client/analytics');
var log = require('./client/log')('welcome-flow:finding-options');
var modal = require('./client/modal');
var RideshareSignUp = require('./client/rideshare-sign-up');
var RouteComparisonTable = require('route-comparison-table');
var RouteResourcesView = require('route-resources-view');
var routeSummarySegments = require('route-summary-segments');
var session = require('session');
var SignUpForm = require('sign-up-form');

/**
 * Create `Modal`
 */

var RouteModal = module.exports = modal({
  closable: true,
  template: require('./template.html'),
  title: 'Selected Option Modal'
}, function(view, route) {
  var context = view.options.context;
  if (context !== 'welcome-flow') {
    analytics.track('Selected Route', {
      context: context,
      plan: session.plan().generateQuery(),
      route: {
        modes: route.modes(),
        summary: route.summary()
      },
      from: context
    });
  }
});

RouteModal.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};

RouteModal.prototype.signUpForRideshare = function(e) {
  e.preventDefault();
  RideshareSignUp().show();
};

RouteModal.prototype.routeComparisonTable = function() {
  return new RouteComparisonTable(this.model);
};

RouteModal.prototype.routeSummarySegments = function() {
  return routeSummarySegments(this.model, {
    inline: true
  });
};

RouteModal.prototype.signUpForm = function() {
  return new SignUpForm();
};

RouteModal.prototype.routeResourcesView = function() {
  return new RouteResourcesView(this.model, null, {
    resources: this.options.resources
  });
};

RouteModal.prototype.routeIntroText = function() {
  switch (this.options.context) {
    case 'welcome-flow':
      return 'Your best option is to';
    case 'help-me-choose':
    case 'route-card':
      return 'You selected';
  }
};

RouteModal.prototype.nextButtonText = function() {
  switch (this.options.context) {
    case 'welcome-flow':
      return 'Show all of my options';
    case 'help-me-choose':
    case 'route-card':
      return 'Return to my options';
  }
};
