var config = require('config');
var debug = require('debug')(config.name() + ':plan:load');
var session = require('session');
var store = require('store');

/**
 * Expose `load`
 */

module.exports = load;

/**
 * Load a plan
 */

function load(Plan, ctx, next) {
  var plan = session.plan();
  if (!plan) {
    debug('loading plan at %s', ctx.path);

    // check if we have a stored plan
    var opts = store('plan') || {};
    if (session.isLoggedIn() && session.commuter()) {
      var commuter = session.commuter();
      debug('loading plan for logged in commuter %s', commuter._id());

      // if the stored plan is not the logged in commuters, change
      if (opts._commuter !== commuter._id()) {
        debug('load plan from the commuter instead of localStorage');

        opts = commuter.opts();
        var org = commuter._organization();

        opts.from = commuter.fullAddress() || opts.from;
        opts.from_ll = commuter.coordinate() || opts.from_ll;

        // if there is an organization attached to this commuter
        if (org && org.model) {
          opts.to = org.fullAddress();
          opts.to_ll = org.coordinate();
        }
      }
    }

    // remove stored patterns & routes
    delete opts.patterns;
    delete opts.routes;

    plan = new Plan(opts);
    session.plan(plan);
  }

  ctx.plan = plan;
  next();
}