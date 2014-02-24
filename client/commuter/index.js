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
    coordinate: {},
    link: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    labels: [],
    opts: {}
  }))
  .use(require('model-query'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/commuters')
  .attr('_id')
  .attr('_organization')
  .attr('_user')
  .attr('name')
  .attr('coordinate')
  .attr('address')
  .attr('city')
  .attr('state')
  .attr('zip')
  .attr('link')
  .attr('labels')
  .attr('created', {
    type: 'date'
  })
  .attr('updated', {
    type: 'date'
  })
  .attr('opts');

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
 * Address
 */

Commuter.prototype.location = function() {
  return this.city() + ', ' + this.state() + ' ' + this.zip();
};

/**
 * Return map marker opts
 */

Commuter.prototype.mapMarker = function() {
  var c = this.coordinate();
  var coordinate = [obscure(c.lng), obscure(c.lat)];

  return map.createMarker({
    title: 'Approx. location of ' + this._user().email,
    description: '<a href=\"/manage/organizations/' + this._organization() +
      '/commuters/' +
      this._id() + '/show\">' + this.location() + '</a>',
    color: '#5cb85c',
    coordinate: coordinate,
    icon: 'building',
    size: 'small'
  });
};

/**
 * Obscure a ll by a bit
 */

function obscure(l) {
  return parseInt(l * 1000) / 1000;
}
