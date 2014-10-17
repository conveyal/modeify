var log = require('log')('welcome-flow:locations');
var modal = require('modal');

/**
 * Create `Modal`
 */

var Locations = module.exports = modal({
  category: 'planner-welcome',
  template: require('./template.html'),
  title: 'Locations Modal'
});

Locations.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};
