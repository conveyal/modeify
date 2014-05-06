var config = require('config');
var debug = require('debug')(config.application() + ':location');
var defaults = require('model-defaults');
var model = require('model');

/**
 * Expose `Location`
 */

var Location = module.exports = model('Location')
  .use(defaults({

  }))
  .use(require('model-geo'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/locations')
  .attr('_id')
  .attr('category')
  .attr('created_by')
  .attr('name');
