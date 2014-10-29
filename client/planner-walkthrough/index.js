var introJs = require('intro.js').introJs;

/**
 * Expose a function to activate the walktrhough
 */

module.exports = function walkthrough() {
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
    steps: [{
      intro: 'Let\'s take a look at how to use CarFreeAtoZ!'
    }, {
      element: document.querySelector('#locations-form'),
      intro: 'Here you can change your start and end locations, the day and time you typically travel, and the travel modes you\'d like to see.',
      position: 'bottom'
    }, {
      element: document.querySelector('.Options'),
      intro: 'These are the best options we found for your trip. We sorted them using a combination of factors including cost, calories burned, ease, and time.',
      position: 'top'
    }, {
      element: document.querySelectorAll('.option')[0],
      intro: 'Here you can explore the details of a specifc option including step by step directions and the factors we\'ve used to rate this option.',
      position: 'top'
    }, {
      element: document.querySelector('.show-profile-button'),
      intro: 'Click the Profile button to edit your travel preferences, manage your account, or view saved journeys.',
      position: 'left',
    }]
  });

  intro.start();
};
