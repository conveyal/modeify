/**
 * Dependencies
 */

var defaults = require('model-defaults');
var model = require('model');

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    from: '1111 Army Navy Drive, Arlington, VA 22202',
    to: '1133 15th St NW, Washington, DC 20005',
    start: 7,
    end: 9,
    ampm: 'am',
    bike: true,
    bus: true,
    train: true,
    car: true,
    walk: true,
    days: 'M—F'
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
  .attr('days');

/**
 * Load
 */

Plan.load = function(ctx, next) {
  ctx.plan = new Plan();
  next();
};
