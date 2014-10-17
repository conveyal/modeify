var Journey = require('journey');
var log = require('log')('planner-nav');
var page = require('page');
var Profile = require('commuter-profile');
var textModal = require('text-modal');
var view = require('view');
var AboutPage = require('about-page');

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
 * Show Profile
 */

View.prototype.showProfile = function(e) {
  if (e) e.preventDefault();
  var commuter = this.model.commuter();
  var plan = this.model.plan();
  Journey.all(function(err, journeys) {
    if (err) {
      log.error('%j', err);
      textModal('Failed to load journeys.');
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

/**
 * Show About
 */

View.prototype.showAbout = function(e) {
  if (e) e.preventDefault();
  var about = new AboutPage();
  about.show();
};
