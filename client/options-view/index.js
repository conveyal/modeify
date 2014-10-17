var config = require('config');
var debug = require('debug')(config.name() + ':options-view');

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
  this.model.emit('change optionsSummary', this.optionsSummary());
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

View.prototype.optionsSummary = function() {
  return 'We found <strong>' + this.optionsCount() + '</strong> ' + this.modeList() + ' ' + this.optionsPlural();
};

View.prototype.optionsCount = function() {
  return this.model.options().length;
};

View.prototype.modeList = function() {
  var modes = [];
  if(this.model.bus() || this.model.train()) modes.push('transit');
  if(this.model.walk()) modes.push('walking');
  if(this.model.bike()) modes.push('biking');
  if(this.model.car()) modes.push('driving');

  if(modes.length > 1) modes[modes.length -1] = ' &amp; ' + modes[modes.length -1];

  return modes.join(modes.length > 2 ? ', ' : ' ');
};

View.prototype.optionsPlural = function() {
  return 'option' + (this.model.options().length > 1 ? 's' : '');
};
