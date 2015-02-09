/**
 * Dependencies
 */

var alerts = require('alerts');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':commuter-page');
var map = require('map');
var page = require('page');
var request = require('./client/request');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');
  if (ctx.params.commuter === 'new' || !ctx.commuter) return;

  ctx.view = new View(ctx.commuter, {
    organization: ctx.organization
  });
  ctx.view.on('rendered', function(v) {
    if (ctx.commuter.validCoordinate()) {
      var m = window.map = map(v.find('.map'), {
        center: ctx.commuter.coordinate(),
        zoom: 13
      });

      m.addMarker(ctx.commuter.mapMarker());
      m.addMarker(ctx.organization.mapMarker());
      m.fitLayer(m.featureLayer);
    }
  });

  next();
};

/**
 * Destroy
 */

View.prototype.destroy = function(e) {
  e.preventDefault();
  if (window.confirm('Delete commuter?')) {
    var url = '/manager/organizations/' + this.model._organization() + '/show';
    this.model.destroy(function(err) {
      if (err) {
        debug(err);
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted commuter.'
        });
        page(url);
      }
    });
  }
};

/**
 * Send
 */

View.prototype.sendPlan = function(e) {
  e.preventDefault();
  if (window.confirm('Resend invitation to commuter?')) {
    request.post('/commuters/' + this.model._id() + '/send-plan', {}, function(
      err, res) {
      if (err || !res.ok) {
        debug(err, res);
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

/**
 * To Location
 */

View.prototype.toLocation = function() {
  return this.options.organization.fullAddress();
};
