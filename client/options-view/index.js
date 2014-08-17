var OptionView = require('./option');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  var year = view.find('.per-year');
  var trip = view.find('.per-trip');
  model.on('change per_year', function(val) {
    if (val) {
      year.classList.add('active');
      trip.classList.remove('active');
    } else {
      year.classList.remove('active');
      trip.classList.add('active');
    }
  });
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

