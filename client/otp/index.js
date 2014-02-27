/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':otp');
var jsonp = require('jsonp');
var profiler = require('otpprofiler.js');
var qs = require('querystring');

/**
 * Expose `profile`
 */

module.exports.profile = function(query, callback) {
  var str = qs.stringify(query);
  debug('profiling %s', str);
  jsonp(config.otp_url() + '/profile?' + str, callback);
};

/**
 * Expose `profile`
 */

module.exports.patterns = function(profile, callback) {
  var response = new profiler.models.OtpProfileResponse(profile);
  var loader = new profiler.transitive.TransitiveLoader(response, config.otp_url() +
    '/', callback);
};
