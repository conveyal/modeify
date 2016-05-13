var fs = require('fs')
var analytics = require('../analytics')
var config = require('../config')
var modal = require('../modal')
var RideshareSignUp = require('../rideshare-sign-up')
var RouteComparisonTable = require('../route-comparison-table')
var RouteResourcesView = require('../route-resources-view')
var routeSummarySegments = require('../route-summary-segments')
var session = require('../session')
var SignUpForm = require('../sign-up-form')
var hogan = require('hogan.js')
var each = require('component-each')



/**
 * Create `Modal`
 */

var RouteModal = module.exports = modal({
  closable: true,
  template: fs.readFileSync(__dirname + '/template.html'),
  title: 'Selected Option Modal'
}, function (view, route) {
  var context = view.options.context
  if (context !== 'welcome-flow') {
    analytics.track('Selected Route', {
      context: context,
      plan: session.plan().generateQuery(),
      route: {
        modes: route.modes(),
        summary: route.summary()
      },
      from: context
    })
  }
})

RouteModal.prototype.commuterConnectionsLogo = function () {
  return config.static_url() + '/images/application/commuter-connections.png'
}

RouteModal.prototype.next = function (e) {
  e.preventDefault()
  this.emit('next')
}

RouteModal.prototype.signUpForRideshare = function (e) {
  e.preventDefault()
  RideshareSignUp().show()
}

RouteModal.prototype.routeComparisonTable = function () {
  return new RouteComparisonTable(this.model)
}

RouteModal.prototype.routeSummarySegments = function () {
  return routeSummarySegments(this.model, {
    inline: true
  })
}

RouteModal.prototype.signUpForm = function () {
  return new SignUpForm()
}

RouteModal.prototype.routeResourcesView = function () {
  return new RouteResourcesView(this.model, null, {
    resources: this.options.resources
  })
}

RouteModal.prototype.routeIntroText = function () {
  switch (this.options.context) {
    case 'welcome-flow':
      return 'Your best option is to'
    case 'help-me-choose':
    case 'route-card':
      return 'You selected'
  }
}

RouteModal.prototype.nextButtonText = function () {
  switch (this.options.context) {
    case 'welcome-flow':
      return 'Show all of my options'
    case 'help-me-choose':
    case 'route-card':
      return 'Return to my options'
  }
}

var intMatchesTemplate = hogan.compile(fs.readFileSync(__dirname + '/internal-matches.html'))

RouteModal.prototype.internalMatches = function () {
  if (this.model.get('internalCarpoolMatches')) {
    var matches = this.model.get('internalCarpoolMatches').matches
  }

  // group matches by organization
  var matchesByOrg = {}
  each(matches, function (match) {
    if (!(match.organization.id in matchesByOrg)) {
      matchesByOrg[match.organization.id] = {
        name: match.organization.name,
        url: match.organization.url,
        matches: []
      }
    }
    matchesByOrg[match.organization.id].matches.push(match)
  })

  // pass array of organizations (w/ matches) to template
  var orgArray = []
  for (var id in matchesByOrg) orgArray.push(matchesByOrg[id])
  return intMatchesTemplate.render({ organizations: orgArray })
}
