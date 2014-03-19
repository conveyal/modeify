/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':commuter');
var defaults = require('model-defaults');
var map = require('map');
var model = require('model');
var request = require('request');

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = model('Commuter')
  .use(defaults({
    _user: {},
    name: '',
    link: '',
    labels: [],
    opts: {}
  }))
  .use(require('model-geo'))
  .use(require('model-query'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/commuters')
  .attr('_id')
  .attr('_organization')
  .attr('_user')
  .attr('name')
  .attr('link')
  .attr('labels')
  .attr('opts')
  .attr('status');

/**
 * Load middleware
 */

Commuter.load = function(ctx, next) {
  if (ctx.params.commuter === 'new') return next();

  Commuter.get(ctx.params.commuter, function(err, commuter) {
    if (err) {
      next(err);
    } else {
      ctx.commuter = commuter;
      next();
    }
  });
};

/**
 * Load all commuters for an org middleware
 */

Commuter.loadOrg = function(ctx, next) {
  if (ctx.params.organization === 'new') return next();

  Commuter.query({
    _organization: ctx.params.organization
  }, function(err, commuters, res) {
    if (err || !res.ok) {
      debug(err || res.err || res.error);
      next(err || new Error(res.text));
    } else {
      ctx.commuters = commuters;
      next();
    }
  });
};

/**
 * Return map marker opts
 */

Commuter.prototype.mapMarker = function() {
  var c = this.fuzzyCoordinate();

  return map.createMarker({
    title: 'Approx. location of ' + this._user().email,
    description: '<a href=\"/manage/organizations/' + this._organization() +
      '/commuters/' +
      this._id() + '/show\">' + this.fuzzyAddress() + '</a>',
    color: '#5cb85c',
    coordinate: [c.lng, c.lat],
    icon: 'building',
    size: 'small'
  });
};
