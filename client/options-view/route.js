/**
 * Dependencies
 */

var convert = require('convert');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./route.html'));

/**
 * Average Time
 */

View.prototype.average = function() {
  return convert.secondsToMinutes(this.model.stats.avg);
};
