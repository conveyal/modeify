var introJs = require('intro.js').introJs;
var log = require('log')('welcome-flow');
var LocationsView = require('locations-view');

var FindingOptions = require('./finding-options');
var Introduction = require('./introduction');
var Locations = require('./locations');
var Welcome = require('./welcome');

window.walkthrough = walkthrough;

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
    walkthrough();
  });

  // Start!
  welcome.show();
};

/**
 * Intro JS
 */

function walkthrough() {
  var intro = introJs();

  intro.onbeforechange(function(el) {
    if (el.classList.contains('option')) {
      var simple = el.querySelector('.simple .show-hide');
      simple.click();
    }
  });

  intro.setOptions({
    disableInteraction: false,
    exitOnEsc: false,
    exitOnOverlayClick: false,
    overlayOpacity: 1,
    scrollToElement: true,
    showBullets: false,
    showProgress: false,
    showStepNumbers: false,
    skipLabel: 'Exit',
    steps: [
      {
        element: document.querySelector('#locations-form'),
        intro: 'Here you can change your start and end locations, the day and time you typically travel, and the travel modes you\'d like to see.',
        position: 'bottom'
      },
      {
        element: document.querySelector('.Options'),
        intro: 'Here are all of your options!',
        position: 'top'
      },
      {
        element: document.querySelectorAll('.option')[0],
        intro: 'More details of a specific option.',
        position: 'top'
      },
      {
        element: document.querySelector('.show-profile-button'),
        intro: 'Click the Profile button to edit your travel preferences, manage your account, or view saved journeys.',
        position: 'bottom',
      }
    ]
  });

  intro.start();
}
