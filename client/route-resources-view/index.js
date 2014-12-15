var hogan = require('hogan.js');
var view = require('view');
var each = require('each');

var resources = require('./resources');

var resourceTemplate = hogan.compile(require('./resource.html'));

var View = module.exports = view(require('./template.html'));

View.prototype.resources = function() {
  var resourceHtml = '';
  each(resources, function(resource) {
    if(resourceMatch(resource, this.model)) {
      resourceHtml += resourceTemplate.render(resource);
    }
  }, this);
  return resourceHtml;
};

var resourceMatch = function(resource, route) {
  var routeModes = route.get('modes');

  if(resource['modes-only']) {
    if(routeModes.length !== 1) return false;
    if(resource['modes-only'].indexOf(routeModes[0]) === -1) return false;
  }
  else if(resource.modes) {
    // find intersection between route and resource mode arrays:
    var isect = routeModes.filter(function(n) {
      return resource.modes.indexOf(n) != -1;
    });
    if(isect.length === 0) return false;
  }

  // TODO: geography-based filtering

  return true;
};