var querystring = require('component-querystring')
var scrollbarSize = require('scrollbar-size')

var config = require('../config')
var FilterView = require('../filter-view')
var HelpMeChoose = require('../help-me-choose-view')
var LeafletTransitiveLayer = require('leaflet-transitivelayer')
var LocationsView = require('../locations-view')
var log = require('../log')('planner-page')
var showMapView = require('../map-view')
var OptionsView = require('../options-view')
var PlannerNav = require('../planner-nav')
var Share = require('../share-view')
var session = require('../session')
var transitive = require('../transitive')
var ua = require('../user-agent')
var view = require('../view')
var showWelcomeWizard = require('../welcome-flow')
var showWalkThrough = require('../planner-walkthrough')
var ServiceAlertsView = require('../service-alerts-view')
var _tr = require('../translate')

var FROM = config.geocode().start_address
var TO = config.geocode().end_address
var isMobile = window.innerWidth <= 480

var showMapView = require('../map-view')

var View = view(require('./template.html'), function (view, model) {
  _tr.inHTML(view, '.btn-default')
  _tr.inHTML(view, '.title2')
  _tr.attribute(view, '.icon-reverse', 'title')
  view.scrollable = view.find('.scrollable')
  view.panelFooter = view.find('.footer')
  view.optionsContainer = view.find('.options-container')
  view.welcomeBox = view.find('.welcome-box')

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

  var transitiveLayer
  var plan = ctx.session.plan()
  var query = querystring.parse(window.location.search)

  if (query.from === 'null') query.from = null
  if (query.to === 'null') query.to = null

  // Set up the views
  var views = {
    'service-alerts-view': new ServiceAlertsView(session),
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
    transitiveLayer = new LeafletTransitiveLayer(transitive)

    // Set the transitive layer
    map.addLayer(transitiveLayer)

    // Update map on plan change
    updateMapOnPlanChange(plan, map, transitive, transitiveLayer)

    // Clear plan & cookies for now, plan will re-save automatically on save
    plan.clearStore()

    // If it's a shared URL or welcome is complete skip the welcome wizard
    if (query.planFrom || query.planTo || (query.from && query.to) || session.commuter().profile().welcome_wizard_complete) {
      showQuery(query)
    } else {
      showWelcomeWizard(session.commuter(), session.plan())
    }

    // If it's a from/to-only shared URL, do show the welcome box (in the options area)
    if (query.planFrom || query.planTo) {
      ctx.view.welcomeBox.classList.remove('hidden')
    }
  })

  plan.on('updating options', function () {
    ctx.view.panelFooter.classList.add('hidden')
    if (plan.from() && plan.to()) {
      ctx.view.optionsContainer.classList.remove('hidden')
      ctx.view.welcomeBox.classList.add('hidden')
    }
  })

  plan.on('updating options complete', function (res) {
    if (res && !res.err) ctx.view.panelFooter.classList.remove('hidden')
  })

  plan.on('welcome skipped', function () {
    if (!plan.from() || !plan.to()) {
      ctx.view.welcomeBox.classList.remove('hidden')
    }
  })

  next()
}

/**
 * Get Application name
 */

View.prototype.applicationName = function () {
  return config.name()
}

/**
 * Show Walk Through
 */

View.prototype.showWalkThrough = function (e) {
  showWalkThrough()
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
 * Share
 */

View.prototype.share = function (e) {
  Share(session.plan().options()).show()
}

/**
 * Show Journey
 */

function showQuery (query) {
  var plan = session.plan()
  // If no querystring, see if we have them in the plan already

  var from, to
  if (query.planTo) {
    to = query.planTo
    from = null
  } else if (query.planFrom) {
    from = query.planFrom
    to = null
  } else {
    from = query.from || plan.from() || FROM
    to = query.to || plan.to() || TO
  }

  if (!from) {
    plan.from(null)
    plan.from_ll(null)
  }
  if (!to) {
    plan.to(null)
    plan.to_ll(null)
  }

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
  // Register plan update events
  plan.on('change journey', function (journey) {
    if (journey && journey.places && journey.places.length > 0 && !isMobile) {
      try {
        log('updating data')
        transitive.updateData(journey)
        if (plan.from() && plan.to()) {
          const bounds = transitiveLayer.getBounds()
          map.fitBounds(bounds)
        }
      } catch (e) {
        console.error(e)
        console.error(e.stack)
      }
    }
  })
}
