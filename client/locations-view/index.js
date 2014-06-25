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

  // Create a new location on change
  var location = new Location({
    address: address
  });

  // Creates a new location & saves
  location.save(function(err, res) {
    if (err) {
      debug(err);
      window.alert('Invalid address.');
    } else {
      var changes = {};
      changes[name] = 'address';
      changes[name + '_ll'] = res.body.coordinate;
      changes[name + '_id'] = res.body._id;
      changes[name + '_valid'] = true;

      plan.set(changes);
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
