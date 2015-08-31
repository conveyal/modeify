var model = require('model')

/**
 * Expose `User`
 */

module.exports = model('User')
  .attr('id')
  .attr('customData')
  .attr('email')
  .attr('givenName')
  .attr('surname')
