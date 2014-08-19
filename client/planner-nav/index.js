var config = require('config');
var debug = require('debug')(config.application() + ':planner-nav');
var Journey = require('journey');
var page = require('page');
var Profile = require('commuter-profile');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Scroll to top
 */

View.prototype.scrollToTop = function(e) {
  e.preventDefault();
  document
    .getElementById('scrollable')
    .scrollTop = 0;
};

/**
 * Application Name
 */

View.prototype.application = function() {
  return config.application();
};

/**
 * Logout
 */

View.prototype.logout = function(e) {
  if (e) e.preventDefault();
  if (window.confirm('Are you sure you want to sign out?')) {
    this.model.logout(function(err) {
      page('/');
    });
  }
};

/**
 * Show Profile
 */

View.prototype.showProfile = function(e) {
  if (e) e.preventDefault();
  var commuter = this.model.commuter();
  var plan = this.model.plan();
  Journey.all(function(err, journeys) {
    if (err) {
      debug(err);
      window.alert('Failed to load journeys.');
    } else {
      var profile = new Profile({
        commuter: commuter,
        journeys: journeys,
        plan: plan
      });
      profile.show(function() {});
    }
  });
};
