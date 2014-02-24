/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':otp');
var jsonp = require('jsonp');
var qs = require('querystring');

/**
 * Expose `profile`
 */

module.exports.profile = function(from, to, callback) {
  debug('profiling %s to %s', from, to);
  jsonp(config.otp_url() + '/profile?' + qs.stringify({
    from: [from.lat, from.lng],
    to: [to.lat, to.lng]
  }), callback);
};
