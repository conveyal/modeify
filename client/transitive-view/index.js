/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':transitive-view');
var profiler = require('otpprofiler.js');
var Transitive = require('transitive');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  var routes = model.routes();
  if (routes && routes.length > 0) view.display(routes);
  model.on('change routes', function(routes) {
    view.display(routes);
  });
});

/**
 * Display
 */

View.prototype.display = function(routes) {
  debug('displaying...');
  var el = this.find('.map');
  var response = new profiler.models.OtpProfileResponse({
    options: routes.slice(0, 3)
  });
  new profiler.transitive.TransitiveLoader(response, config.otp_url() + '/', function(data) {
    debug('profiled and loaded');
    var transitive = new Transitive(el, data, {}, {
      gridCellSize: 800
    });
    transitive.render();
  });
};
