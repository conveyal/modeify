var Spinner = require('spin');

/**
 * Store one spinner at a time
 */

var spinner = new Spinner();

/**
 * Expose `spinner`
 */

module.exports = function() {
  if (spinner !== null) return spinner;

  spinner.spin(document.body);

  spinner.remove = function() {
    if (spinner) spinner.stop();
  };

  return spinner;
};
