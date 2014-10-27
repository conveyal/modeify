var config = require('config');
var fmt = require('fmt');
var log = require('log')('otp');
var Profiler = require('otp-profiler');
var qs = require('querystring');

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
  log('--> profiling');
  log('--  see raw results here: %s', generateUrl(query));

  profiler.profile(query, function(err, data) {
    if (err) {
      log.error('<-- error profiling', err);
      callback(err, data);
    } else if (!data.options || data.options.length < 1) {
      log.warning('<-- no options found');
      callback('No options found', data);
    } else {
      query.profile = data;
      profiler.journey(query, function(err, journey) {
        if (err) {
          log.error('<-- error profiling', err);
          callback(err, journey);
        } else {
          log('<-- profiled %s options', data.options.length);
          callback(null, {
            journey: journey,
            options: data.options
          });
        }
      });
    }
  });
};

/**
 * OTP Url
 */

module.exports.url = generateUrl;

function generateUrl(query) {
  return fmt('%s/api/otp/profile?%s', config.base_url(),
    decodeURIComponent(qs.stringify({
      from: query.from.lat + ',' + query.from.lon,
      to: query.to.lat + ',' + query.to.lon,
      bikeSpeed: query.bikeSpeed,
      startTime: query.startTime,
      endTime: query.endTime,
      date: query.date,
      modes: query.modes,
      walkSpeed: query.walkSpeed
    })));
}
