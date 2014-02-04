/**
 * Dependencies
 */

var defaults = require('model-defaults');
var memoize = require('model-memoize');
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
  .use(memoize)
  .route('/api/organizations')
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
      ctx.error = err;
    } else {
      ctx.organization = org;
    }
    next();
  });
};

/**
 * Return map marker opts
 */

Organization.prototype.mapMarker = function() {
  var c = this.coordinate();
  return {
    title: '<a href="/organizations/' + this._id() + '">' + this.name() + '</a>',
    description: this.address() + '<br>' + this.city() + ', ' + this.state() +
      ' ' + this.zip(),
    color: '#428bca',
    coordinate: [c.lng, c.lat],
    icon: 'commercial'
  };
};
