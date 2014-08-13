var OptionView = require('./option');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Set the routes view
 */

View.prototype['options-view'] = function() {
  return OptionView;
};

