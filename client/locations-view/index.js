/**
 * Dependencies
 */

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
  var parent = el.parentNode;
  var self = this;
  var model = this.model;

  if (address === model[name]()) return;

  geocode(address, function(err, ll) {
    if (!err) {
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
