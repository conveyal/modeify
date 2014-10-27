var OptionView = require('./option');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  model.on('change options', function() {
    model.emit('change optionsSummary', view.optionsSummary());
  });
});

/**
 * Set the routes view
 */

View.prototype['options-view'] = function() {
  return OptionView;
};

View.prototype.optionsSummary = function() {
  if (this.optionsCount() > 0) {
    return 'We found <strong>' + this.optionsCount() + '</strong> ' + this.modeList() + ' ' + this.optionsPlural();
  } else {
    var plan = this.model;
    var msg = 'No results! ';

    if (!plan.validCoordinates()) {
      msg += 'The addresses entered could not be located.';
    } else if (!plan.bus() || !plan.train()) {
      msg += 'Try turning all transit modes on.';
    } else if (!plan.bike()) {
      msg += 'Add biking to see bike-to-transit results.';
    } else if (!plan.car()) {
      msg += 'Unfortunately we were unable to find non-driving results. Try turning on driving.';
    } else if (plan.end_time() - plan.start_time() < 2) {
      msg += 'Make sure the hours you specified are large enough to encompass the length of the journey.';
    } else if (plan.days() !== 'M—F') {
      msg += 'Transit runs less often on the weekends. Try switching to a weekday.';
    }

    return msg;
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
