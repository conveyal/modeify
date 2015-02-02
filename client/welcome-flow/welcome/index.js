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
  while (!el.classList.contains('answer') && el.parentNode) el = el.parentNode;
  var answer = el.getAttribute('data-answer') || '';
  if (answer && answer.length > 1) {
    this.recordAnswer(answer);
    this.emit('next');
  } else {
    log.warn('-- invalid answer');
  }
};

/**
 * Record Answer
 */

Welcome.prototype.recordAnswer = function(answer) {
  this.model.updateProfile('initial_mode_of_transportation', answer);
  this.model.save();
};
