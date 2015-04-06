var config = require('config')
var model = require('model')

/**
 * Expose `Journey`
 */

module.exports = model('Journey')
  .route(config.api_url() + '/journeys')
  .attr('_id')
  .attr('created_by')
  .attr('locations')
  .attr('opts')
