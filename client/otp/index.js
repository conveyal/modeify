var config = require('config');
var debug = require('debug')(config.application() + ':otp');
var process = require('./process');
var Profiler = require('otpprofiler.js');
var request = require('request');
var spin = require('spinner');

/**
 * Create profiler
 */

var profiler = new Profiler({
  host: '/api/otp'
});

/**
 * Expose `profile`
 */

module.exports.profile = function(query, callback) {
  debug('--> profiling %s', JSON.stringify(query));
  var spinner = spin();
  profiler.profile(query, function(err, data) {
    if (!data) {
      data = {
        options: []
      };
    }

    debug('<-- profiled %s options', data.options.length);
    spinner.remove();
    callback(err, process(data));
  });
};

/**
 * Expose `patterns`
 */

module.exports.patterns = function(opts, callback) {
  var spinner = spin();
  profiler.journey(opts, function(err, data) {
    spinner.remove();
    callback(err, data);
  });
};
