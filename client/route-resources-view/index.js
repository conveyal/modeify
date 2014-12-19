var hogan = require('hogan.js');
var view = require('view');
var each = require('each');

var routeResource = require('route-resource');

var resourceTemplate = hogan.compile(require('./resource.html'));

var View = module.exports = view(require('./template.html'));

View.prototype.resources = function() {
  var resourceHtml = '';
  each(this.options.resources, function(resource) {
    resourceHtml += resourceTemplate.render(resource);
  });
  return resourceHtml;
};

View.prototype.resourceClicked = function(evt) {
  evt.preventDefault();
  if(evt.target.nodeName.toLowerCase() === 'a') {
    var resourceName = evt.target.parentNode.parentNode.getAttribute('data-name');
    var linkUrl = evt.target.href;
    window.open(linkUrl,'_blank');
    // TODO: log click action in user profile, storing resourceName and linkUrl
  }
};
