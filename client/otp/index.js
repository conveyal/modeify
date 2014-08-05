var config = require('config');
var debug = require('debug')(config.application() + ':otp');
var Profiler = require('otp-profiler');

/**
 * Create profiler
 */

var profiler = new Profiler({
  host: '/api/otp'
});


/**
 * Expose `journey`
 */

module.exports = function profile(query, callback) {
  debug('--> profiling %s', JSON.stringify(query));
  profiler.profile(query, function(err, data) {
    if (err || !data) {
      debug('<-- error profiling', err);
      callback(err);
    } else {
      query.profile = data;
      profiler.journey(query, function(err, journey) {
        if (err) {
          debug('<-- error profiling', err);
          callback(err);
        } else {
          debug('<-- profiled %s options', data.options.length);
          callback(null, {
            journey: journey,
            options: data.options
          });
        }
      });
    }
  });
};
