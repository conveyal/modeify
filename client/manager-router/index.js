var Commuter = require('commuter')
var commuterForm = require('commuter-form')
var Location = require('location')
var LocationForm = require('location-form')
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

p('/', session.checkIfLoggedIn, utils.redirect('/organizations'))

// Public links

p('/login', require('login-page'))
p('/logout', session.logoutMiddleware, utils.redirect('/login'))
p('/forgot-password', require('forgot-password-page'))
p('/change-password/:key', require('change-password-page'))

// Admin only

p('/managers', session.checkIfLoggedIn, session.checkIfAdmin, require('managers-page'))

// Organizations

p('/organizations/(.*)', session.checkIfLoggedIn)
p('/organizations/', require('organizations-page'))
p('/organizations/new', organizationForm)
p('/organizations/:organization/(.*)', Organization.load)
p('/organizations/:organization/show', Commuter.loadOrg, Location.loadOrg, require('organization-page'))
p('/organizations/:organization/edit', organizationForm)

// Locations

p('/organizations/:organization/locations/new', LocationForm)
p('/organizations/:organization/locations/:location/(.*)', Location.load)
p('/organizations/:organization/locations/:location/show', require('location-page'))
p('/organizations/:organization/locations/:location/edit', LocationForm)

// Commuters

p('/organizations/:organization/commuters/new', commuterForm)
p('/organizations/:organization/commuters/:commuter/(.*)', Commuter.load)
p('/organizations/:organization/commuters/:commuter/show', require('commuter-page'))
p('/organizations/:organization/commuters/:commuter/edit', commuterForm)

// Feedback

p('/feedback', session.checkIfLoggedIn, require('feedback-table-page'))

// Render all

p('*', utils.render)
