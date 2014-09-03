var analytics = require('analytics');
var config = require('config');
var debug = require('debug');
var fmt = require('fmt');
var request = require('request');

/**
 * Logging levels
 */

var levels = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

/**
 * Expose `log`
 */

module.exports = function(name) {
  var _debug = debug(config.application() + ':' + name);

  function _log(type, text) {
    if (levels.indexOf(type) === -1) {
      text = fmt.apply(null, arguments);
      type = 'info';
    }

    // Send to analytics
    analytics.track('log:' + type, {
      text: text,
      type: type
    });

    // Send to console
    _debug(text);

    // Send to server
    request
      .post('/log', {
        text: text,
        type: type
      });
  }

  levels.forEach(function(level) {
    _log[level] = function() {
      _log(level, fmt.apply(null, arguments));
    };
  });

  return _log;
};
