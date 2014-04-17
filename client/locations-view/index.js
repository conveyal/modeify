var debug = require('debug');
var geocode = require('geocode');
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
  var model = this.model;

  // If the address hasn't changed, return
  if (address === model[name]()) return;

  // Geocode the new address
  geocode(address, function(err, ll) {
    if (err) {
      window.alert('Invalid address.');
    } else {
      model[name](address);
      model[name + '_ll'](ll);
    }
  });
};

/**
 * Reverse Commute
 */

View.prototype.reverseCommute = function() {
  var plan = this.model;
  var am_pm = plan.am_pm() === 'am' ? 'pm' : 'am';
  plan.set({
    am_pm: am_pm,
    from: plan.to(),
    from_ll: plan.to_ll(),
    reverse_commute: !plan.reverse_commute(),
    to: plan.from(),
    to_ll: plan.from_ll()
  });
};
