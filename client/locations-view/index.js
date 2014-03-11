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

  if (!address) return parent.classList.add('has-warning');
  if (address === model[name]()) return;

  geocode(address, function(err, ll) {
    if (err) {
      parent.classList.add('has-error');
    } else {
      parent.classList.add('has-success');
      self[name + '-timeout'] = setTimeout(function() {
        parent.classList.remove('has-success');
        parent.classList.add('inactive');
        self[name + '-timeout'] = null;
      }, 1000);

      model[name](address);
      model[name + '_ll'](ll);
    }
  });
};

/**
 * Edit
 */

View.prototype.edit = function(e) {
  var name = e.target.name;
  var parent = e.target.parentNode;
  parent.classList.remove('inactive');
  parent.classList.remove('has-error');
  parent.classList.remove('has-success');
  parent.classList.remove('has-warning');
  if (this[name + '-timeout']) clearTimeout(this[name + '-timeout']);
};

/**
 * Reverse Commute
 */

View.prototype.reverseCommute = function() {
  this.model.reverse_commute(!this.model.reverse_commute());
};
