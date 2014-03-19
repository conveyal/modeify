var Spinner = require('spin');

/**
 * Store one spinner at a time
 */

var spinner = new Spinner();
var isSpinning = false;

/**
 * Old remove function
 */

spinner.remove = function() {
  spinner.stop();
  isSpinning = false;
};

/**
 * Expose `spinner`
 */

module.exports = function() {
  if (isSpinning) return spinner;

  spinner.spin(document.body);
  isSpinning = true;

  return spinner;
};
