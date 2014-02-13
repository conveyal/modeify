/**
 * Dependencies
 */

var alerts = require('alerts');
var Commuter = require('commuter');
var debug = require('debug')('organization-page');
var map = require('map');
var Organization = require('organization');
var request = require('request');
var view = require('view');

/**
 * Create `Page`
 */

var Page = view(require('./template.html'));
var Row = view(require('./row.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('render');
  if (ctx.params.organization === 'new' || !ctx.organization) return;

  ctx.view = new Page(ctx.organization);
  ctx.view.on('rendered', function() {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    });
    map.add(m.markerLayer, ctx.organization.mapMarker());

    var tbody = ctx.view.find('tbody');
    ctx.commuters.forEach(function(commuter) {
      var row = new Row(commuter);
      tbody.appendChild(row.el);
      map.add(m.markerLayer, commuter.mapMarker());
    });
    map.fitBounds(m, m.markerLayer.getBounds());
  });
};

/**
 * Destroy
 */

Page.prototype.destroy = function(e) {
  if (window.confirm('Delete organization?')) {
    var page = this;
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        });
        page.emit('go', '/organizations');
      }
    });
  }
};

/**
 * Row labels
 */

Row.prototype.labels = function() {
  var l = this.model.labels();
  return l.map(function(label) {
    return '<span class="label label-default">' + label + '</span>';
  }).join(' ');
};
