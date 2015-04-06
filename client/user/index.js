var config = require('config')
var model = require('model')

/**
 * Expose `User`
 */

module.exports = model('User')
  .route(config.api_url() + '/users')
  .use(require('model-query'))
  .attr('_id')
  .attr('email')
  .attr('email_confirmed')
  .attr('type')
  .attr('created')
  .attr('modified')
