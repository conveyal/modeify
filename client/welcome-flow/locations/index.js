var log = require('log')('welcome-flow:locations');
var modal = require('modal');

/**
 * Create `Modal`
 */

var Locations = module.exports = modal({
  category: 'planner-welcome',
  template: require('./template.html'),
  title: 'Locations Modal'
}, function(view, model) {
  var plan = model.plan;
  plan.on('change', function() {
    if (plan.validCoordinates()) {
      view.enableNext();
    }
  });
});

Locations.prototype.enableNext = function() {
  var button = this.find('.btn');
  button.classList.remove('disabled');
};

Locations.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};
