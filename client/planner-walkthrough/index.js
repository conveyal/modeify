var config = require('../config')
var introJs = require('intro.js').introJs
var _tr = require('../translate')

/**
 * Expose a function to activate the walktrhough
 */

module.exports = function walkthrough () {
  var intro = introJs()

  intro.onbeforechange(function (el) {
    if (el.classList.contains('option')) {
      var simple = el.querySelector('.simple .show-hide')
      simple.click()
    }
  })

  intro.setOptions({
    disableInteraction: false,
    exitOnEsc: false,
    exitOnOverlayClick: false,
    overlayOpacity: 1,
    scrollToElement: false,
    showBullets: false,
    showProgress: false,
    showStepNumbers: false,
    skipLabel: _tr('Skip'),
    steps: [{
      intro: _tr("Let's take a look at how to use ") + config.name() + '!'
    }, {
      element: document.querySelector('#locations-form'),
      intro: _tr("Here you can change your start and end locations, the day and time you typically travel, and the travel modes you'd like to see."),
      position: 'bottom'
    }, {
      element: document.querySelector('.Options'),
      intro: _tr('These are the best options we found for your trip. We sorted them using a combination of factors including cost, calories burned, ease, and time.'),
      position: 'top'
    }, {
      element: document.querySelector('.help-me-choose'),
      intro: _tr('Can\'t decide on an option? Select "Help Me Choose" to compare each factor directly and rank by your own preferences.'),
      position: 'left'
    }, {
      element: document.querySelectorAll('.option')[0],
      intro: _tr("Here you can explore the details of a specifc option including step by step directions and the factors we've used to rate this option."),
      position: 'top'
    }, {
      element: document.querySelector('.show-profile-button'),
      intro: _tr('Go to your profile to change your travel preferences, manage your account, or view saved journeys.'),
      position: 'bottom'
    }]
  })

  intro.start()
}
