var analytics = require('analytics')
var config = require('config')
var introJs = require('intro.js').introJs
var log = require('./client/log')('welcome-flow')
var LocationsView = require('locations-view')
var message = require('./client/messages')('welcomewelcome-flow')
var showPlannerWalkthrough = require('planner-walkthrough')
var RouteModal = require('route-modal')
var routeResource = require('route-resource')

var Locations = require('./locations')
var Welcome = require('./welcome')

var FROM = config.geocode().start_address
var TO = config.geocode().end_address

/**
 * Show Modal
 */

module.exports = function (commuter, plan) {
  var welcome = new Welcome(commuter)
  var locations = new Locations({
    'locations-view': new LocationsView(plan),
    plan: plan,
    commuter: commuter
  })

  plan.setAddresses(FROM, TO, function (err) {
    if (err) {
      log.error('%e', err)
    } else {
      plan.journey({ places: plan.generatePlaces() })
      plan.updateRoutes()
    }
  })

  var nextClicked = false
  welcome.on('hide', skip)
  welcome.on('next', function () {
    nextClicked = true
    locations.show()
    locations.on('hide', skip)
    locations.on('next', function () {
      nextClicked = true
      var route = plan.options()[0]

      routeResource.findByTags(route.tags(plan), function (err, resources) {
        if (err) log.error(err)

        var routeModal = new RouteModal(route, null, {
          context: 'welcome-flow',
          resources: resources,
          plan: plan
        })
        routeModal.show()

        routeModal.on('hide', function () {
          analytics.track('Completed Welcome Wizard')

          commuter.updateProfile('welcome_wizard_complete', true)
          commuter.save()
          highlightResults()
        })
        routeModal.on('next', function () {
          routeModal.hide()
        })
      })
    })

    locations.on('skip', function () {
      locations.hide()
    })
  })

  function skip () {
    if (nextClicked) {
      nextClicked = false
      return
    }
    analytics.track('Exited Welcome Wizard')
    commuter.updateProfile('welcome_wizard_complete', true)
    commuter.save()
    showPlannerWalkthrough()
  }

  // Start!
  welcome.show()
}

/**
 * Intro JS
 */

function highlightResults () {
  var intro = introJs()

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
    steps: [{
      element: document.querySelector('.Options'),
      intro: message('best-options'),
      position: 'top'
    }, {
      element: document.querySelector('nav .fa-question-circle'),
      intro: message('find-more'),
      position: 'left'
    }]
  })

  intro.start()
}
