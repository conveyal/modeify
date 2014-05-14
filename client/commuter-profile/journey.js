var session = require('session');
var template = require('./journey.html');
var view = require('view');

/**
 * Expose `Row`
 */

var Row = module.exports = view(template);

/**
 * From
 */

Row.prototype.from = function() {
  return this.model.locations()[0].original_address;
};

/**
 * To
 */

Row.prototype.to = function() {
  return this.model.locations()[1].original_address;
};

/**
 * Load
 */

Row.prototype.load = function(e) {
  e.preventDefault();

  var locations = this.model.locations();
  var plan = session.plan();
  var from = locations[0];
  var to = locations[1];

  plan.set({
    from: from.original_address,
    from_id: from._id,
    from_ll: from.coordinate,
    to: to.original_address,
    to_id: to._id,
    to_ll: to.coordinate
  });
};

/**
 * Destroy
 */

Row.prototype.destroy = function(e) {
  e.preventDefault();

  var self = this;
  this.model.destroy(function(err) {
    if (err) {
      debug(err);
      window.alert('Failed to remove journey.');
    } else {
      self.el.remove();
    }
  });
};
