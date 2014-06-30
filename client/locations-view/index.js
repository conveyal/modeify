var debug = require('debug');
var Location = require('location');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Geocode && Save
 */

View.prototype.save = function(e) {
  var el = e.target;
  var name = el.name;
  var address = el.value;
  var plan = this.model;

  // If the address hasn't changed, return
  if (address === plan[name]()) return;

  plan.setAddress(name, address, function(err) {
    if (err) {
      debug(err);
      window.alert('Invalid address.');
    }
  });
};

/**
 * Clear
 */

View.prototype.clear = function(e) {
  e.preventDefault();
  var name = e.target.dataset.value;
  var el = this.find('input[name="' + name + '"]');
  el.value = '';
  window.focus(el);
};
