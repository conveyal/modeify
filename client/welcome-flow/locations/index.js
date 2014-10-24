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
  var plan = model.get('plan');
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

Locations.prototype.initialMode = function(e) {
  switch (this.model.get('commuter').get('profile').initial_mode_of_transportation) {
    case 'drive':
      return 'driving';
    case 'carpool':
      return 'carpooling';
    case 'bike':
      return 'biking';
    case 'walk':
      return 'walking';
    case 'transit':
      return 'taking transit';
  }
  return 'your current mode';
};
