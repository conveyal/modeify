/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':plan');
var geocode = require('geocode');
var defaults = require('model-defaults');
var model = require('model');
var otp = require('otp');
var session = require('session');

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    from: '1111 Army Navy Drive, Arlington, VA 22202',
    to: '1133 15th St NW, Washington, DC 20005',
    from_ll: {},
    to_ll: {},
    start: 7,
    end: 9,
    ampm: 'am',
    bike: true,
    bus: true,
    train: true,
    car: true,
    walk: true,
    days: 'M—F',
    routes: []
  }))
  .use(updateRoutesOnLLChange)
  .attr('start')
  .attr('end')
  .attr('ampm')
  .attr('bike')
  .attr('bus')
  .attr('train')
  .attr('car')
  .attr('walk')
  .attr('from')
  .attr('to')
  .attr('from_ll')
  .attr('to_ll')
  .attr('days')
  .attr('routes');

/**
 * Load
 */

Plan.load = function(ctx, next) {
  if (session.isLoggedIn() && session.user().type === 'commuter') {
    var commuter = session.commuter();

    var opts = commuter.opts();
    opts.from = commuter.location();

    var org = commuter._organization();
    opts.to = org.address + ', ' + org.city + ', ' + org.state + ' ' + org.zip;

    ctx.plan = new Plan(opts);
  } else {
    ctx.plan = new Plan();
  }

  next();
};

/**
 * Update routes
 */

Plan.prototype.updateRoutes = function(val, prev) {
  debug('updating routes on ll change');

  var model = this;
  var from = model.from_ll();
  var to = model.to_ll();

  if (from && to && from.lat && from.lng && to.lat && to.lng) {
    debug('updating routes from', from, 'to', to);
    otp.profile(from, to, function(err, data) {
      if (err) {
        model.emit('error', err);
      } else {
        model.routes(data.options);
      }
    });
  } else {
    debug('not updating routes from/to ll does not exist', from, to);
  }
};

/**
 * Geocode
 */

Plan.prototype.geocode = function(dest, callback) {
  if (!callback) callback = function(){};

  var plan = this;
  var address = plan[dest]();
  var ll = plan[dest + '_ll']();
  if (address && address.length > 0 && ll && (!ll.lat || !ll.lng)) {
    geocode(address, function(err, ll) {
      if (err) {
        callback(err);
      } else {
        plan[dest + '_ll'](ll);
        callback(null, ll);
      }
    });
  } else {
    callback(null, ll);
  }
};

/**
 * Update Routes on From/to change
 */

function updateRoutesOnLLChange(Plan) {
  Plan.on('construct', function(plan) {
    plan.on('change from_ll', plan.updateRoutes);
    plan.on('change to_ll', plan.updateRoutes);
  });
}
