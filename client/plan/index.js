/**
 * Dependencies
 */

var series = require('array-series');
var config = require('config');
var debug = require('debug')(config.name() + ':plan');
var defaults = require('model-defaults');
var geocode = require('geocode');
var jsonp = require('jsonp');
var model = require('model');
var querystring = require('querystring');
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
