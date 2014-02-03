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
  var tbody = ctx.view.find('tbody');
  var c = ctx.organization.coordinate();
  ctx.view.on('rendered', function(v) {
    ctx.view.map = map(v.find('.map'), {
      center: c,
      zoom: 13
    });
    map.add(ctx.view.map, {
      color: '#428bca',
      coordinate: [c.lng, c.lat],
      icon: 'commercial'
    });

    ctx.commuters.forEach(function(commuter) {
      var row = new Row(commuter);
      tbody.appendChild(row.el);
      map.add(ctx.view.map, commuter.mapMarker());
    });
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
