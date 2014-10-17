var OptionView = require('./option');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  plan) {
});

/**
 * Set the routes view
 */

View.prototype['options-view'] = function() {
  return OptionView;
};

/**
 * Toggle per year
 */

View.prototype.togglePerYear = function(e) {
  e.preventDefault();
  this.model.per_year(true);
};

/**
 * Toggle per trip
 */

View.prototype.togglePerTrip = function(e) {
  e.preventDefault();
  this.model.per_year(false);
};
