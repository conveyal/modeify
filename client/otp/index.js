var config = require('config');
var debug = require('debug')(config.application() + ':otp');
var Profiler = require('otp-profiler');
var spin = require('spinner');

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
  var spinner = spin();
  profiler.profile(query, function(err, data) {
    if (err || !data) {
      spinner.stop();
      debug('<-- error profiling', err);
      callback(err);
    } else {
      query.profile = data;
      profiler.journey(query, function(err, journey) {
        spinner.stop();
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
