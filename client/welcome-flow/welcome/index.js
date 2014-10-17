var log = require('log')('welcome-flow:welcome');
var modal = require('modal');

/**
 * Create `Modal`
 */

var Welcome = module.exports = modal({
  category: 'planner-welcome',
  template: require('./template.html'),
  title: 'Welcome Modal'
});

/**
 * Save
 */

Welcome.prototype.clickedAnswer = function(e) {
  e.preventDefault();
  log('--> saving');

  var el = e.target;
  var answer = el.dataset.answer || '';
  if (answer && answer.length > 1) {
    this.recordAnswer(answer);
    this.emit('next');
  }
};

/**
 * Record Answer
 */

Welcome.prototype.recordAnswer = function(answer) {
  this.model.updateProfile('initial_mode_of_transportation', answer);
  this.model.save();
};