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

var redirectIfNotAdmin = required(['administrator'], '/organizations')

// Setup & show alerts

p('*', function (ctx, next) {
  ctx.manager = true
  next()
}, require('../alerts'))

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.touch, utils.redirect('/organizations'))

// Public links

p('/logout', session.logoutMiddleware, function () {
  window.location.href = '/manager'
})

// Admin only

p('/managers(.*)', session.touch, redirectIfNotAdmin)
p('/managers', require('../managers-page'))
p('/managers/:manager/show', Organization.loadAll, User.loadManager, require('../manager-page'))

// Organizations

p('/organizations(.*)', session.touch)
p('/organizations', Organization.loadAll, require('../organizations-page'))
p('/organizations/new', redirectIfNotAdmin, organizationForm)

p('/organizations/:organization/(.*)', redirectIfNotOrgManager, Organization.load)
p('/organizations/:organization/show', Location.loadOrg, Ridepool.loadOrg, require('../organization-page'))
p('/organizations/:organization/edit', organizationForm)

// Locations

p('/organizations/:organization/locations/new', LocationForm)
p('/organizations/:organization/locations/:location/(.*)', Location.load)
p('/organizations/:organization/locations/:location/show', require('../location-page'))
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

p('/feedback', session.touch, redirectIfNotAdmin, require('../feedback-table-page'))

// User Signups

p('/user-activity', session.touch, redirectIfNotAdmin, require('../user-activity-page'))

// Alerts

p('/alerts', session.touch, redirectIfNotAdmin, ServiceAlert.loadAll, require('../service-alerts-page'))

// Render all

p('*', utils.render)

// Has rights or redirect to

function required (groups, redirectTo) {
  return function (ctx, next) {
    if (ctx.session.inGroups(groups)) {
      next()
    } else {
      utils.redirect(redirectTo)(ctx, next)
    }
  }
}

function redirectIfNotOrgManager (ctx, next) {
  if (ctx.session.inGroups(['administrator', 'organization-' + ctx.params.organization + '-manager'])) {
    next()
  } else {
    utils.redirect('/organizations/')(ctx, next)
  }
}
