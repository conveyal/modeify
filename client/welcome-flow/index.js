var log = require('log')('welcome-flow');
var LocationsView = require('locations-view');

var FindingOptions = require('./finding-options');
var Introduction = require('./introduction');
var Locations = require('./locations');
var Welcome = require('./welcome');

/**
 * Show Modal
 */

module.exports = function(session) {
  var commuter = session.commuter();
  var plan = session.plan();

  var findingOptions = new FindingOptions(plan);
  var locations = new Locations({
    'locations-view': new LocationsView(plan)
  });
  var introduction = new Introduction();
  var welcome = new Welcome(commuter);

  welcome.on('next', function() {
    introduction.show();
    welcome.hide();
  });

  introduction.on('next', function() {
    locations.show();
    introduction.hide();
  });

  locations.on('next', function() {
    findingOptions.show();
    locations.hide();
  });

  findingOptions.on('next', function() {
    commuter.updateProfile('welcome_wizard_complete', true);
    commuter.save();

    findingOptions.hide();
  });

  // Start!
  welcome.show();
};
