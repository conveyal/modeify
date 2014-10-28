var Alert = require('alert');
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
  var button = this.find('.btn');
  button.classList.add('loading');

  var alerts = this.find('.alerts');
  alerts.innerHTML = '';

  var plan = this.model.plan;
  var self = this;
  plan.updateRoutes({}, function(err, data) {
    if (err) {
      button.classList.remove('loading');
      button.classList.add('disabled');

      alerts.appendChild(Alert({
        type: 'danger',
        text: err
      }).el);
    } else {
      self.emit('next');
    }
  });
};

Locations.prototype.initialMode = function(e) {
  var commuter = this.model.commuter;
  var profile = commuter.profile();

  switch (profile.initial_mode_of_transportation) {
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
