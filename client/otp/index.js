var clone = require('clone');
var config = require('config');
var fmt = require('fmt');
var log = require('./client/log')('otp');
var Profiler = require('otp-profiler');
var qs = require('querystring');
var superagent = require('superagent');


/**
 * Create profiler
 */

var profiler = new Profiler({
  host: '/api/otp'
});

/**
 * Expose `journey`
 */

module.exports = function profile(query, filter, callback) {
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
      query.profile = filter(data);
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

module.exports.plan = function (query, callback) {
    superagent
        .get('/api/otp/plan')
        .query(query)
        .end(function(err, res) {
            if (err || res.body.error || !res.ok) {
                callback(err || res.body.error || res.text, res);
            } else {
		        profiler.journeyWithPlan(res.body, function(err, journey) {
                    if (err) {
                        log.error('<-- error profiling', err);
                        callback(err, journey);
                    } else {
                        log('<-- profiled %s options', res.body.length);
                        callback(null, {
                            journey: journey,
                            options: res.body,
                            plan: res.body.plan
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
  var data = clone(query);
  data.from = query.from.lat + ',' + query.from.lon;
  data.to = query.to.lat + ',' + query.to.lon;

  return fmt('%s/api/otp/profile?%s', config.base_url(), decodeURIComponent(qs.stringify(data)));
}
