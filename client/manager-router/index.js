var Commuter = require('commuter')
var CommuterLocation = require('commuter-location')
var commuterForm = require('commuter-form')
var Location = require('location')
var LocationForm = require('location-form')
var Ridepool = require('ridepool')
var RidepoolForm = require('ridepool-form')
var Organization = require('organization')
var organizationForm = require('organization-form')
var p = require('page')
var session = require('session')
var utils = require('router-utils')

// Setup & show alerts

p('*', function (ctx, next) {
  ctx.manager = true
  next()
}, require('alerts'))

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.touch, utils.redirect('/organizations'))

// Public links

p('/logout', session.logoutMiddleware, utils.redirect('/'))

// Admin only

p('/managers', session.touch, require('managers-page'))

// Organizations

p('/organizations/(.*)', session.touch)
p('/organizations/', require('organizations-page'))
p('/organizations/new', organizationForm)
p('/organizations/:organization/(.*)', Organization.load)
p('/organizations/:organization/show', Commuter.loadOrg, Location.loadOrg, Ridepool.loadOrg, require('organization-page'))
p('/organizations/:organization/edit', organizationForm)

// Locations

p('/organizations/:organization/locations/new', LocationForm)
p('/organizations/:organization/locations/:location/(.*)', Location.load)
p('/organizations/:organization/locations/:location/show', CommuterLocation.forLocationMiddleware, require('location-page'))
p('/organizations/:organization/locations/:location/edit', LocationForm)
p('/organizations/:organization/locations/:location/analyze', CommuterLocation.forLocationMiddleware, require('commute-analysis-page'))
p('/organizations/:organization/locations/:location/distribute', require('commute-distribution-page'))

// Carpool/Vanpools

p('/organizations/:organization/ridepools/new', RidepoolForm)
p('/organizations/:organization/ridepools/:ridepool/(.*)', Ridepool.load)
p('/organizations/:organization/ridepools/:ridepool/edit', RidepoolForm)

// Commuters

p('/organizations/:organization/locations/:location/commuters/new', commuterForm)
p('/organizations/:organization/locations/:location/commuters/:commuter/(.*)', Commuter.load)
p('/organizations/:organization/locations/:location/commuters/:commuter/show', require('commuter-page'))
p('/organizations/:organization/locations/:location/commuters/:commuter/edit', commuterForm)

// Feedback

p('/feedback', session.touch, require('feedback-table-page'))

// Render all

p('*', utils.render)
