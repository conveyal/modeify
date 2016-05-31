var Commuter = require('../commuter')
var CommuterLocation = require('../commuter-location')
var commuterForm = require('../commuter-form')
var Location = require('../location')
var LocationForm = require('../location-form')
var Ridepool = require('../ridepool')
var RidepoolForm = require('../ridepool-form')
var Organization = require('../organization')
var organizationForm = require('../organization-form')
var ServiceAlert = require('../service-alert')

var p = require('page')
var session = require('../session')
var User = require('../user')
var utils = require('../router-utils')

// Setup & show alerts

p('*', function (ctx, next) {
  ctx.manager = true
  next()
}, require('../alerts'))

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.touch, redirectToOrgIfManager, utils.redirect('/organizations'))

// Public links

p('/logout', session.logoutMiddleware, function () {
  window.location.href = '/manager'
})

// Admin only

p('/managers(.*)', session.touch, required(['administrator'], '/organizations'))
p('/managers', require('../managers-page'))
p('/managers/:manager/show', Organization.loadAll, User.loadManager, require('../manager-page'))

// Organizations

p('/organizations(.*)', session.touch)
p('/organizations', redirectToOrgIfManager, Organization.loadAll, require('../organizations-page'))
p('/organizations/new', redirectToOrgIfManager, organizationForm)

p('/organizations/:organization/(.*)', Organization.load)
p('/organizations/:organization/show', Commuter.loadOrg, Location.loadOrg, Ridepool.loadOrg, require('../organization-page'))
p('/organizations/:organization/edit', organizationForm)

// Locations

p('/organizations/:organization/locations/new', LocationForm)
p('/organizations/:organization/locations/:location/(.*)', Location.load)
p('/organizations/:organization/locations/:location/show', CommuterLocation.forLocationMiddleware, require('../location-page'))
p('/organizations/:organization/locations/:location/edit', LocationForm)
p('/organizations/:organization/locations/:location/analyze', CommuterLocation.forLocationMiddleware, require('../commute-analysis-page'))
p('/organizations/:organization/locations/:location/distribute', require('../commute-distribution-page'))
p('/organizations/:organization/locations/:location/ridematch', require('../location-ridematch-settings'))

// Carpool/Vanpools

p('/organizations/:organization/ridepools/new', RidepoolForm)
p('/organizations/:organization/ridepools/:ridepool/(.*)', Ridepool.load)
p('/organizations/:organization/ridepools/:ridepool/edit', RidepoolForm)

// Commuters

p('/organizations/:organization/locations/:location/commuters/new', commuterForm)
p('/organizations/:organization/locations/:location/commuters/:commuter/(.*)', Commuter.load)
p('/organizations/:organization/locations/:location/commuters/:commuter/show', require('../commuter-page'))
p('/organizations/:organization/locations/:location/commuters/:commuter/edit', commuterForm)

// Feedback

p('/feedback', session.touch, require('../feedback-table-page'))

// User Signups

p('/user-activity', session.touch, require('../user-activity-page'))

// Alerts

p('/alerts', session.touch, ServiceAlert.loadAll, require('../service-alerts-page'))

// Render all

p('*', utils.render)

// Has rights or redirect to

function required (groups, all, redirectTo) {
  return function (ctx, next) {
    if (ctx.session.inGroups(groups, all)) {
      next()
    } else {
      utils.redirect(redirectTo)(ctx, next)
    }
  }
}

function redirectToOrgIfManager (ctx, next) {
  if (ctx.session.inGroups(['administrator'])) {
    next()
  } else {
    utils.redirect('/organizations/' + ctx.session.user().getOrganizationId() + '/show')(ctx, next)
  }
}
