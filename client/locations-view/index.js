var closest = require('closest');
var config = require('config');
var debug = require('debug')(config.application() + ':locations-view');
var Location = require('location');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  plan) {
  view.on('rendered', function() {
    closest(view.el, 'form').onsubmit = function(e) {
      e.preventDefault();

      plan.setAddresses(view.find('input[name="from"]').value, view.find(
        'input[name="to"]').value, function(err) {
        if (err) {
          debug(err);
        } else {
          plan.updateRoutes();
        }
      });
    };
  });
});

/**
 * Address Changed
 */

View.prototype.addressChanged = function(e) {
  this.save(e.target);
};

/**
 * Geocode && Save
 */

View.prototype.save = function(el, callback) {
  this.model.setAddress(el.name, el.value, function(err) {
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
