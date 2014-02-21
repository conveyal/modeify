/**
 * Dependencies
 */

var each = require('each');

/**
 * Expose `getters` for config vars
 */

each(window.CONFIG, function(key, val) {
  var g = function() {
    return val;
  };
  module.exports[key] = g;
  module.exports[key.toLowerCase()] = g;
});
