/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':user');
var model = require('model');

/**
 * Expose `Manager`
 */

var User = module.exports = model('User')
  .route(config.api_url() + '/users')
  .use(require('model-query'))
  .attr('_id')
  .attr('email')
  .attr('type')
  .attr('created')
  .attr('modified');
