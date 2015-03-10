var evnt = require('event');
var Profile = require('commuter-profile');
var Journey = require('journey');
var log = require('./client/log')('planner-nav');
var MarkdownModal = require('./client/markdown-modal');
var page = require('page');
var showWalkThrough = require('planner-walkthrough');
var getTemplate = require('./client/template');
var textModal = require('text-modal');
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

View.prototype.showMenu = function() {
  var menu = this.find('.menu');
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    evnt.bind(document.documentElement, 'click', hideMenu);
  } else {
    hideMenu();
  }

  function hideMenu() {
    menu.classList.add('hidden');
    evnt.unbind(document.documentElement, 'click', hideMenu);
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

View.prototype.showAbout = function(e) {
  if (e) e.preventDefault();
  MarkdownModal({
    content: getTemplate('about')
  }).show();
};

View.prototype.showTermsAndConditions = function(e) {
  if (e) e.preventDefault();
  MarkdownModal({
    content: getTemplate('terms')
  }).show();
};

/**
 * Show Walk Through
 */

View.prototype.showWalkThrough = function(e) {
  if (e) e.preventDefault();
  showWalkThrough();
};
