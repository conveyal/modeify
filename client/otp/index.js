/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':otp');
var jsonp = require('jsonp');
var profiler = require('otpprofiler.js');
var qs = require('querystring');
var spin = require('spinner');

/**
 * Expose `profile`
 */

module.exports.profile = function(query, callback) {
  var str = qs.stringify(query);
  debug('profiling %s', str);
  var spinner = spin();
  jsonp(config.otp_url() + '/profile?' + str, function() {
    spinner.remove();
    callback.apply(null, arguments);
  });
};

/**
 * Expose `profile`
 */

module.exports.patterns = function(profile, callback) {
  var spinner = spin();
  var response = new profiler.models.OtpProfileResponse(profile);
  var loader = new profiler.transitive.TransitiveLoader(response, config.otp_url() +
    '/', function() {
      spinner.remove();
      callback.apply(null, arguments);
    });
};
