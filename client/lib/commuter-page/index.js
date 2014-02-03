/**
 * Dependencies
 */

var alerts = require('alerts');
var Commuter = require('commuter');
var debug = require('debug')('commuter-page');
var map = require('map');
var template = require('./template.html');
var view = require('view');

/**
 * Create `Page`
 */

var Page = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('render');
  if (ctx.params.commuter === 'new' || !ctx.commuter) return;

  ctx.view = new Page(ctx.commuter);
  ctx.view.on('rendered', function(v) {
    var m = map(v.find('.map'), {
      center: ctx.commuter.coordinate(),
      zoom: 13
    });
    map.add(m, {
      color: '#5cb85c',
      coordinate: [ctx.commuter.coordinate().lng, ctx.commuter.coordinate()
        .lat
      ],
      icon: 'building'
    });
    var c = ctx.commuter.organization().coordinate;
    map.add(m, {
      color: '#428bca',
      coordinate: [c.lng, c.lat],
      icon: 'commercial'
    });
    m.fitBounds(m.markerLayer.getBounds());
  });
};

/**
 * Destroy
 */

Page.prototype.destroy = function() {
  if (window.confirm('Delete commuter?')) {
    var page = this;
    var url = '/organizations/' + this.model._organization();
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted commuter.'
        });
        page.emit('go', url);
      }
    });
  }
};
