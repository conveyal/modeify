var config = require('config')
var FilterView = require('filter-view')
var HelpMeChoose = require('help-me-choose-view')
var LeafletTransitiveLayer = require('Leaflet.TransitiveLayer')
var LocationsView = require('locations-view')
var log = require('./client/log')('planner-page')
var showMapView = require('map-view')
var OptionsView = require('options-view')
var PlannerNav = require('planner-nav')
var querystring = require('querystring')
var scrollbarSize = require('scrollbar-size')
var session = require('session')
var transitive = require('transitive')
var ua = require('user-agent')
var view = require('view')
var showWelcomeWizard = require('welcome-flow')

var FROM = config.geocode().start_address
var TO = config.geocode().end_address
var isMobile = window.innerWidth <= 480

var View = view(require('./template.html'), function (view, model) {
  view.scrollable = view.find('.scrollable')
  view.panelFooter = view.find('.footer')

  if (scrollbarSize > 0) {
    if (ua.os.name === 'Windows' || ua.browser.name !== 'Chrome') {
      view.scrollable.style.marginRight = -scrollbarSize + 'px'
    }

    // Scrollbars are fun and implemented the same on every OS/Browser...right
    if (ua.os.name === 'Windows' && ua.browser.name === 'Chrome') {
      view.scrollable.style.paddingRight = scrollbarSize + 'px'
    }
  }
})

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('render')

  var plan = ctx.plan
  var query = querystring.parse(window.location.search)

  // Set up the views
  var views = {
    'filter-view': new FilterView(plan),
    'locations-view': new LocationsView(plan),
    'options-view': new OptionsView(plan),
    'planner-nav': new PlannerNav(session)
  }

  ctx.view = new View(views)
  ctx.view.on('rendered', function () {
    // Set plan to loading
    plan.loading(true)

    for (var key in views) {
      views[key].emit('rendered', views[key])
    }

    // Show the map
    var map = showMapView(ctx.view.find('.MapView'))

    // Create the transitive layer
    var transitiveLayer = new LeafletTransitiveLayer(transitive)

    // Set the transitive layer
    map.addLayer(transitiveLayer)

    // Update map on plan change
    updateMapOnPlanChange(plan, map, transitive, transitiveLayer)

    // Clear plan & cookies for now, plan will re-save automatically on save
    plan.clearStore()

    // If it's a shared URL or welcome is complete skip the welcome screen
    if ((query.from && query.to) || session.commuter().profile().welcome_wizard_complete) {
      showQuery(query)
    } else {
      showWelcomeWizard(session)
    }
  })

  plan.on('updating options', function () {
    ctx.view.panelFooter.classList.add('hidden')
  })

  plan.on('updating options complete', function (res) {
    if (res && !res.err) ctx.view.panelFooter.classList.remove('hidden')
  })

  next()
}

/**
 * Reverse Commute
 */

View.prototype.reverseCommute = function (e) {
  e.preventDefault()
  var plan = session.plan()
  plan.set({
    from: plan.to(),
    from_id: plan.to_id(),
    from_ll: plan.to_ll(),
    to: plan.from(),
    to_id: plan.from_id(),
    to_ll: plan.from_ll()
  })

  plan.updateRoutes()
}

/**
 * Scroll
 */

View.prototype.scroll = function (e) {
  e.preventDefault()
  this.scrollable.scrollTop += (this.scrollable.scrollHeight / 5)
}

/**
 * On submit
 */

View.prototype.onsubmit = function (e) {
  e.preventDefault()
}

/**
 * Help Me Choose
 */

View.prototype.helpMeChoose = function (e) {
  HelpMeChoose(session.plan().options()).show()
}

/**
 * Show Journey
 */

function showQuery (query) {
  var plan = session.plan()
  // If no querystring, see if we have them in the plan already
  var from = query.from || plan.from() || FROM
  var to = query.to || plan.to() || TO
  var sameAddresses = from === plan.from() && to === plan.to()

  // Set plan from querystring
  if (query.modes) plan.setModes(query.modes)
  if (query.start_time !== undefined) plan.start_time(parseInt(query.start_time, 10))
  if (query.end_time !== undefined) plan.end_time(parseInt(query.end_time, 10))
  if (query.days !== undefined) plan.days(query.days)

  // If has valid coordinates, load
  if (plan.validCoordinates() && sameAddresses) {
    plan.journey({
      places: plan.generatePlaces()
    })
    plan.updateRoutes()
  } else {
    // Set addresses and update the routes
    plan.setAddresses(from, to, function (err) {
      if (err) {
        log.error('%e', err)
      } else {
        plan.journey({
          places: plan.generatePlaces()
        })
        plan.updateRoutes()
      }
    })
  }
}

/**
 * Update Map on plan change
 */

function updateMapOnPlanChange (plan, map, transitive, transitiveLayer) {
  var matchedFeatures = null
  // Register plan update events
  plan.on('change journey', function (journey) {
    if (journey && !isMobile) {
      try {
        log('updating data')
        transitive.updateData(journey)
        map.fitBounds(transitiveLayer.getBounds())
      } catch (e) {
        console.error(e)
        console.error(e.stack)
      }
    }
  })

  plan.on('change matches', function (matchLocations) {
    if (matchedFeatures) {
      map.removeLayer(matchedFeatures)
      matchedFeatures = null
    }

    if (matchLocations && matchLocations.length > 0 && !isMobile) {

      var features = []
      matchLocations.forEach(function(matchLocation) {
        features = features.concat(matchLocation.matches.map(function (match) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [match.commuter.coordinate.lng, match.commuter.coordinate.lat]
            },
            properties: {
              title: match.distance.toFixed(2) + ' miles away',
              description: '<a href="#">Email ' + match.commuter.name + ' to set up your carpool!</a>',
              'marker-size': 'small',
              'marker-color': '#455a71',
              'marker-symbol': 'car'
            }
          }
        }))
      })

      matchedFeatures = window.L.mapbox.featureLayer({
        type: 'FeatureCollection',
        features: features
      })

      matchedFeatures.addTo(map)
    }
  })
}
