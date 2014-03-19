var config = require('config');
var debug = require('debug')(config.application() + ':organization-page');
var map = require('map');
var View = require('./view');

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('attach view');

  ctx.organization.commuters = ctx.commuters;
  ctx.view = window.view = new View(ctx.organization);
  ctx.view.on('rendered', function() {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    });
    m.addMarker(ctx.organization.mapMarker());

    var cluster = new L.MarkerClusterGroup();
    ctx.commuters.forEach(function(commuter) {
      if (commuter.validCoordinate()) cluster.addLayer(commuter.mapMarker());
    });

    m.addLayer(cluster);
    m.fitLayers([m.featureLayer, cluster]);
  });

  next();
};
