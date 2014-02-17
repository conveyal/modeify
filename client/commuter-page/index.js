/**
 * Dependencies
 */

var alerts = require('alerts');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':commuter-page');
var go = require('go');
var map = require('map');
var request = require('request');
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
    var m = window.map = map(v.find('.map'), {
      center: ctx.commuter.coordinate(),
      zoom: 13
    });

    m.addMarker(ctx.commuter.mapMarker());
    m.addMarker(ctx.organization.mapMarker());
    m.fitLayer(m.featureLayer);
  });
};

/**
 * Destroy
 */

Page.prototype.destroy = function(e) {
  e.preventDefault();
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
        go(url);
      }
    });
  }
};

/**
 * Send
 */

Page.prototype.sendPlan = function(e) {
  e.preventDefault();
  if (window.confirm('Send personalized plan to commuter?')) {
    request.post('/commuters/' + this.model._id() + '/send-plan', {}, function(
      err, res) {
      if (err || !res.ok) {
        console.error(err, res);
        window.alert('Failed to send plan.');
      } else {
        alerts.show({
          type: 'success',
          text: 'Emailed plan to commuter.'
        });
      }
    });
  }
};
