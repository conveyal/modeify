
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
    start: 7,
    end: 9,
    bike: true,
    bus: true,
    train: true,
    car: true,
    walk: true
  }))
  .attr('start')
  .attr('end')
  .attr('bike')
  .attr('bus')
  .attr('train')
  .attr('car')
  .attr('walk');
