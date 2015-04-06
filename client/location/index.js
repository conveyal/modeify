var config = require('config')
var model = require('model')

/**
 * Expose `Location`
 */

module.exports = model('Location')
  .use(require('model-geo'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/locations')
  .attr('_id')
  .attr('category')
  .attr('created_by')
  .attr('name')
