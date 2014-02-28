/**
 * Dependencies
 */

var convert = require('convert');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Average Time
 */

View.prototype.average = function() {
  return Math.round(this.model.stats.avg / 60);
};

/**
 * Summary
 */

View.prototype.summary = function() {
  return this.model.segments.map(function(segment) {
    return segment.routeShortName;
  }).join(' — ');
};
