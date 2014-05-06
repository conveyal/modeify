var config = require('config');
var debug = require('debug')(config.application() + ':commuter-profile');
var modal = require('modal');
var spin = require('spinner');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 *
 */

View.prototype.show = function(callback) {
  this.modal = modal(this.el)
    .overlay()
    .closable()
    .show(callback);
};

/**
 * Hide
 */

View.prototype.hide = function() {
  if (this.modal) this.modal.hide();
};

/**
 * Journey View
 */

View.prototype['journeys-view'] = function() {
  return require('./journey');
};
