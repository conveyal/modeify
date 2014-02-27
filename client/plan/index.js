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
var store = require('store');

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    from: '',
    to: '',
    original_modes: null,
    from_ll: null,
    to_ll: null,
    start_time: 7,
    end_time: 9,
    am_pm: 'am',
    bike: false,
    bus: false,
    train: false,
    car: false,
    walk: false,
    days: 'M—F',
    routes: [],
    patterns: null,
    commuter: null
  }))
  .attr('original_modes')
  .attr('start_time')
  .attr('end_time')
  .attr('am_pm')
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
  .attr('routes')
  .attr('patterns');

/**
 * Sync plans with localStorage
 */

Plan.on('change', function(plan) {
  var json = plan.toJSON();

  // remove routes & patterns
  delete json.routes;
  delete json.patterns;

  // save in local storage
  store('plan', json);

  // if we've created a commuter object, save to the commuter
  var commuter = session.commuter();
  if (commuter) {
    commuter.opts(json);
    commuter.save();
  }
});

/**
 * If the filters change, update the viz
 */

['am_pm', 'days', 'start_time', 'end_time', 'from_ll', 'to_ll'].forEach(
  function(attr) {
    Plan.on('change ' + attr, function(plan) {
      plan.updateRoutes();
    });
  });

/**
 * Once the routes have changed, get the patterns
 */

Plan.on('change routes', function(plan, routes) {
  otp.patterns({
    options: routes
  }, function(patterns) {
    plan.patterns(patterns);
  });
});

/**
 * Load plan middleware
 */

Plan.load = function(ctx, next) {
  debug('loading plan at %s', ctx.path);

  // check if we have a stored plan
  var opts = store('plan');
  if (session.isLoggedIn() && session.commuter()) {
    var commuter = session.commuter();
    debug('loading plan for logged in commuter %s', commuter._id());

    // if the stored plan is not the logged in commuters, change
    if (opts.commuter !== commuter._id()) {
      debug('load plan from the commuter instead of localStorage');

      opts = commuter.opts();
      var org = commuter._organization();

      opts.from = commuter.fullAddress();
      opts.from_ll = commuter.coordinate();

      // if there is an organization attached to this commuter
      if (org && org.model) {
        opts.to = org.fullAddress();
        opts.to_ll = org.coordinate();
      }
    }
  }

  ctx.plan = new Plan(opts);
  next();
};

/**
 * Update routes
 */

Plan.prototype.updateRoutes = function() {
  debug('updating routes on ll change');

  var model = this;
  var from = model.from_ll();
  var to = model.to_ll();
  var startTime = model.start_time();
  var endTime = model.end_time();

  if (model.am_pm() === 'pm') {
    startTime += 12;
    endTime += 12;

    if (endTime === 24) endTime = 0;
  }

  if (from && to && from.lat && from.lng && to.lat && to.lng) {
    debug('updating routes from', from, 'to', to);
    otp.profile({
      from: [from.lat, from.lng],
      to: [to.lat, to.lng],
      startTime: startTime + ':00',
      endTime: endTime + ':00'
    }, function(err, data) {
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
  if (!callback) callback = function() {};

  var plan = this;
  var address = plan[dest]();
  var ll = plan[dest + '_ll']();
  if (address && address.length > 0) {
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
