var config = require('config')
var model = require('model')
var request = require('./client/request')

/**
 * Expose `Campaign`
 */

var Campaign = module.exports = model('campaign')
  .route(config.api_url() + '/campaigns')
  .attr('_id')
  .attr('_organization')
  .attr('completed')
  .attr('filters')
  .attr('status')

  /**
   * Send
   */

Campaign.prototype.send = function (callback) {
  request.get('/campaigns/' + this._id() + '/send', callback)
}
