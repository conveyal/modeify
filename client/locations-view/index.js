/**
 * Dependencies
 */

var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Save
 */

View.prototype.saveFrom = View.prototype.saveTo = function(e) {
  e.target.parentNode.classList.add('inactive');
};

/**
 * Edit
 */

View.prototype.editFrom = View.prototype.editTo = function(e) {
  e.target.parentNode.classList.remove('inactive');
};
