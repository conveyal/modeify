var FeedbackModal = require('feedback-modal');
var RouteCardView = require('route-card-view');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  view.lastResponse = {};
  view.lastCardSelected = null;
  model.on('updating options complete', function(data) {
    view.errorMessage = data.err;
    model.emit('change optionsSummary');
  });
});

/**
 * Set the routes view
 */

View.prototype['options-view'] = function() {
  return RouteCardView;
};

View.prototype.optionsSummary = function() {
  if (this.optionsCount() > 0) {
    return 'Found <strong>' + this.optionsCount() + '</strong> ' + this.modeList() + ' ' + this.optionsPlural();
  } else {
    return this.errorMessage || '';
  }
};

View.prototype.optionsCount = function() {
  return this.model.options().length;
};

View.prototype.modeList = function() {
  var modes = [];
  if (this.model.bus() || this.model.train()) modes.push('transit');
  if (this.model.bike()) modes.push('biking');
  if (this.model.car()) modes.push('driving');

  if (modes.length > 1) modes[modes.length - 1] = ' &amp; ' + modes[modes.length - 1];

  return modes.join(modes.length > 2 ? ', ' : ' ');
};

View.prototype.optionsPlural = function() {
  return 'option' + (this.optionsCount() > 1 ? 's' : '');
};

View.prototype.feedback = function(e) {
  e.preventDefault();
  FeedbackModal().show();
};
