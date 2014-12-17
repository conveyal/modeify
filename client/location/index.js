var config = require('config');
var debug = require('debug')(config.application() + ':location');
var model = require('model');

/**
 * Expose `Location`
 */

var Location = module.exports = model('Location')
  .use(require('model-geo'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/locations')
  .attr('_id')
  .attr('category')
  .attr('created_by')
  .attr('name');
