/**
 * Dependencies
 */

var defaults = require('model-defaults');
var memoize = require('model-memoize');
var model = require('model');
var request = require('request');

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = model('Commuter')
  .use(defaults({
    name: '',
    email: '',
    coordinate: {},
    address: '',
    city: '',
    state: '',
    zip: '',
    labels: [],
    organization: {}
  }))
  .use(memoize)
  .route('/api/commuters')
  .attr('_id')
  .attr('_organization')
  .attr('organization')
  .attr('name')
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
 * Load via middleware
 */

Commuter.load = function(ctx, next) {
  if (ctx.params.commuter === 'new') return next();

  Commuter.get(ctx.params.commuter, function(err, commuter) {
    if (err) {
      next(err);
    } else {
      ctx.commuter = commuter;
      if (ctx.organization) ctx.commuter.organization(ctx.organization.toJSON());
      next();
    }
  });
};

/**
 * Load via link
 */

Commuter.loadLink = function(ctx, next) {
  request.get('/commuters/link/' + ctx.params.link, function(err, res) {
    if (err || !res.ok) {
      next(err || new Error(res.text));
    } else {
      ctx.commuter = new Commuter(res.body);
      next();
    }
  });
};

/**
 * Load all commuters for an org via middleware
 */

Commuter.loadOrg = function(ctx, next) {
  if (ctx.params.organization === 'new') return next();

  request.get('/commuters', {
    _organization: ctx.params.organization
  }, function(err, res) {
    if (err || !res.ok) {
      next(err || new Error(res.text));
    } else {
      ctx.commuters = res.body.map(function(commuter) {
        return new Commuter(commuter);
      });
      next();
    }
  });
};

/**
 * Generate a link
 */

Commuter.prototype.link = function() {
  var address = this.address() + ', ' + this.city() + ', ' + this.state() + ' ' +
    this.zip();
  var org = this.organization().address + ', ' + this.organization().city +
    ', ' + this.organization().state + ' ' + this.organization().zip;
  return '/planner#results?from=' + address + '&to=' +
    org;
};

/**
 * Return map marker opts
 */

Commuter.prototype.mapMarker = function() {
  var c = this.coordinate();
  return {
    title: '<a href=\"/organizations/' + this._organization() + '/commuters/' +
      this._id() + '\">' + this.name() + '</a>',
    description: this.address() + '<br>' + this.city() + ', ' + this.state() +
      ' ' + this.zip(),
    color: '#5cb85c',
    coordinate: [c.lng, c.lat],
    icon: 'building',
    size: 'small'
  };
};
