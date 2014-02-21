/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':organization');
var defaults = require('model-defaults');
var map = require('map');
var model = require('model');

/**
 * Expose `Organization`
 */

var Organization = module.exports = model('Organization')
  .use(defaults({
    name: '',
    contact: '',
    email: '',
    coordinate: {},
    address: '',
    city: '',
    state: '',
    zip: '',
    labels: []
  }))
  .use(require('model-memoize'))
  .use(require('model-query'))
  .route(config.api_url() + '/organizations')
  .attr('_id')
  .attr('name')
  .attr('contact')
  .attr('email')
  .attr('coordinate')
  .attr('address')
  .attr('city')
  .attr('state')
  .attr('zip')
  .attr('labels')
  .attr('created', {
    type: 'date'
  })
  .attr('updated', {
    type: 'date'
  });

/**
 * Load middleware
 */

Organization.load = function(ctx, next) {
  if (ctx.params.organization === 'new') return next();

  Organization.get(ctx.params.organization, function(err, org) {
    if (err) {
      next(err);
    } else {
      ctx.organization = org;
      next();
    }
  });
};

/**
 * Location
 */

Organization.prototype.location = function() {
  return this.address() + ', ' + this.city() + ', ' + this.state() + ' ' + this
    .zip();
};

/**
 * Return map marker opts
 */

Organization.prototype.mapMarker = function() {
  var c = this.coordinate();
  return map.createMarker({
    title: '<a href="/manager/organizations/' + this._id() + '/show">' + this
      .name() +
      '</a>',
    description: this.location(),
    color: '#428bca',
    coordinate: [c.lng, c.lat],
    icon: 'commercial'
  });
};
