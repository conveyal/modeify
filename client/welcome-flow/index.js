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
    'locations-view': new LocationsView(plan),
    plan: plan
  });
  var introduction = new Introduction();
  var welcome = new Welcome(commuter);

  welcome.on('next', function() {
    introduction.show();
    setTimeout(function() {
      welcome.hide();
    }, 0);
  });

  introduction.on('next', function() {
    locations.show();
    setTimeout(function() {
      introduction.hide();
    }, 0);
  });

  locations.on('next', function() {
    findingOptions.show();
    setTimeout(function() {
      locations.hide();
    }, 0);
  });

  findingOptions.on('next', function() {
    commuter.updateProfile('welcome_wizard_complete', true);
    commuter.save();

    findingOptions.hide();
  });

  // Start!
  welcome.show();
};
