var Option = require('./option');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Set the routes view
 */

View.prototype['routes-view'] = function() {
  return Option;
};
