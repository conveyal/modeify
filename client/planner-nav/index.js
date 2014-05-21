var config = require('config');
var debug = require('debug')(config.application() + ':planner-nav');
var Journey = require('journey');
var page = require('page');
var Profile = require('commuter-profile');
var spin = require('spinner');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Application Name
 */

View.prototype.application = function() {
  return config.application();
};

/**
 * Logout
 */

View.prototype.logout = function() {
  if (window.confirm('Are you sure you want to sign out?')) {
    this.model.logout(function(err) {
      page('/');
    });
  }
};

/**
 * Save journey
 */

View.prototype.saveJourney = function(e) {
  var plan = this.model.plan();
  plan.saveJourney(function(err) {
    if (err) {
      debug(err);
      window.alert('Failed to save journey.\n' + err);
    } else {
      window.alert('Saved journey successfully');
    }
  });
};

/**
 * Show Profile
 */

View.prototype.showProfile = function() {
  var spinner = spin();
  Journey.all(function(err, journeys) {
    if (err) {
      debug(err);
      window.alert('Failed to load journeys.');
    } else {
      var profile = new Profile({
        journeys: journeys
      });
      profile.show(function() {
        spinner.stop();
      });
    }
  });
};
