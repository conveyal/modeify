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

  this.model.from(this.find('[name="from"]').value);
  this.model.to(this.find('[name="to"]').value);
};

/**
 * Edit
 */

View.prototype.editFrom = View.prototype.editTo = function(e) {
  e.target.parentNode.classList.remove('inactive');
};
