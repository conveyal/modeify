var introJs = require('intro.js').introJs;
var log = require('log')('welcome-flow');
var LocationsView = require('locations-view');
var model = require('model');

var FindingOptions = require('./finding-options');
var Locations = require('./locations');
var Welcome = require('./welcome');

window.walkthrough = walkthrough;

/**
 * Show Modal
 */

module.exports = function(session) {
  var commuter = session.commuter();
  var plan = session.plan();
  var main = document.querySelector('#main');

  main.classList.add('Welcome');

  var findingOptions = new FindingOptions(plan);
  var locationsScreenModel = model('LocationsScreen')
    .attr('locations-view')
    .attr('plan')
    .attr('commuter')({
    'locations-view': new LocationsView(plan),
    plan: plan,
    commuter: commuter
  });
  var locations = new Locations(locationsScreenModel);
  var welcome = new Welcome(commuter);

  welcome.on('next', function() {
    locations.model.emit('change initialMode', locations.initialMode());
    locations.show();
    setTimeout(function() {
      welcome.hide();
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

    main.classList.remove('Welcome');
    findingOptions.hide();
    highlightResults();
  });

  // Start!
  welcome.show();
};

/**
 * Intro JS
 */


function highlightResults() {
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
    scrollToElement: false,
    showBullets: false,
    showProgress: false,
    showStepNumbers: false,
    skipLabel: 'Skip',
    doneLabel: 'Close',
    steps: [
      {
        element: document.querySelector('.Options'),
        intro: '<strong>Here are your best options!</strong> We\'ve searched all combinations of available travel modes to find the best trips for you, ranked based on their benefits versus driving alone. Use this screen to explore your options and plan any other trips you\'d like to take!',
        position: 'top'
      }
    ]
  });

  intro.start();
}

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
    scrollToElement: false,
    showBullets: false,
    showProgress: false,
    showStepNumbers: false,
    skipLabel: 'Exit',
    steps: [
      {
        intro: 'Let\'s take a look at your journey!'
      },
      {
        element: document.querySelector('#locations-form'),
        intro: 'Here you can change your start and end locations, the day and time you typically travel, and the travel modes you\'d like to see.',
        position: 'bottom'
      },
      {
        element: document.querySelector('.Options'),
        intro: 'These are the best options we found for your trip. We sorted them using a combination of factors including cost, calories burned, ease, and time.',
        position: 'top'
      },
      {
        element: document.querySelectorAll('.option')[0],
        intro: 'Here you can explore the details of a specifc option including step by step directions and the factors we\'ve used to rate this option.',
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
