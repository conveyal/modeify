var config = require('config');
var debug = require('debug')(config.application() + ':journey');
var model = require('model');

/**
 * Expose `Journey`
 */

var Journey = module.exports = model('Journey')
  .use(require('model-memoize'))
  .route(config.api_url() + '/journeys')
  .attr('_id')
  .attr('created_by')
  .attr('locations')
  .attr('opts');
