var analytics = require('../analytics')
var convert = require('../convert')
var Feedback = require('../feedback-modal')
var log = require('../log')('route-card-view')
var mouseenter = require('mouseenter')
var mouseleave = require('mouseleave')
var RouteDirections = require('../route-directions-table')
var RouteModal = require('../route-modal')
var routeSummarySegments = require('../route-summary-segments')
var routeResource = require('../route-resource')
var session = require('../session')
var transitive = require('../transitive')
var view = require('../view')
var _tr = require('../translate')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
  _tr.inHTML(view, '.distance2')
  _tr.inHTML(view, '.btn-default')
  _tr.inHTML(view, '.btn-sm')
  _tr.inHTML(view, 'a')
  mouseenter(view.el, function () {
    var id = model.id() + ''
    if (id.indexOf('transit') === -1) {
      id = id + '_' + model.access()[0].mode.toLowerCase()
    }
    if (transitive.network.journeys[id] !== undefined) {
      transitive.focusJourney(id)
    }
  })

  mouseleave(view.el, function () {
    if (!view.el.classList.contains('expanded')) {
      transitive.focusJourney()
    }
  })
})

View.prototype.directions = function () {
  return new RouteDirections(this.model)
}

View.prototype.segments = function () {
  return routeSummarySegments(this.model)
}

View.prototype.costSavings = function () {
  return convert.roundNumberToString(this.model.costSavings())
}

View.prototype.timeSavingsAndNoCostSavings = function () {
  return this.model.timeSavings() && !this.model.costSavings()
}

/**
 * Show/hide
 */

View.prototype.showDetails = function (e) {
  e.preventDefault()
  var el = this.el
  var expanded = document.querySelector('.option.expanded')
  if (expanded) expanded.classList.remove('expanded')

  el.classList.add('expanded')

  analytics.track('Expanded Route Details', {
    plan: session.plan().generateQuery(),
    route: {
      modes: this.model.modes(),
      summary: this.model.summary()
    }
  })

  var scrollable = document.querySelector('.scrollable')
  scrollable.scrollTop = el.offsetTop - 52
}

View.prototype.hideDetails = function (e) {
  e.preventDefault()
  var list = this.el.classList
  if (list.contains('expanded')) {
    list.remove('expanded')
  }
}

/**
 * Get the option number for display purposes (1-based)
 */

View.prototype.optionNumber = function () {
  return this.model.index + 1
}

/**
 * View
 */

View.prototype.feedback = function (e) {
  e.preventDefault()
  Feedback(this.model).show()
}

/**
 * Select this option
 */

View.prototype.selectOption = function () {
  var route = this.model
  var plan = session.plan()
  var tags = route.tags(plan)

  routeResource.findByTags(tags, function (err, resources) {
    if (err) log.error(err)
    var routeModal = new RouteModal(route, null, {
      context: 'route-card',
      resources: resources
    })
    routeModal.show()
    routeModal.on('next', function () {
      routeModal.hide()
    })
  })
}
