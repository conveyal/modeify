var analytics = require('analytics');
var each = require('each');
var hogan = require('hogan.js');
var routeResource = require('route-resource');
var view = require('view');

var resourceTemplate = hogan.compile(require('./resource.html'));

var View = module.exports = view(require('./template.html'));

View.prototype.resources = function() {
  var resourceHtml = '';
  each(this.options.resources, function(resource) {
    resourceHtml += resourceTemplate.render(resource);
  });
  return resourceHtml;
};

View.prototype.resourceClicked = function(e) {
  e.preventDefault();
  if (e.target.nodeName.toLowerCase() === 'a') {
    var resourceName = e.target.parentNode.parentNode.getAttribute('data-name');
    var linkUrl = e.target.href;

    analytics.track('Selected Route Resource', {
      resource: resourceName,
      url: linkUrl
    });

    window.open(linkUrl, '_blank');
  }
};

View.prototype.toggleDetails = function(e) {
  var target = e.target;
  while (!target.classList.contains('resource')) target = target.parentNode;
  target.classList.toggle('expanded');
};
