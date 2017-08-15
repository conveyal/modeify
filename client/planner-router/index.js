var analytics = require('../analytics')
var store = require('../browser-store')
var CommuterProfile = require('../commuter-profile')
var page = require('page')
var Modal = require('../modal')
var utils = require('../router-utils')
var session = require('../session')

var redirectToPlanner = utils.redirect('/planner')

page('*', function (ctx, next) {
  Modal.hide() // clear all modals
  next()
})

page('/', redirectToPlanner)

page('/logout', session.logoutMiddleware, function () {
  window.location.href = '/'
})

page('/planner', session.touch, require('../planner-page'), require('../announcements'))
page('/planner/:link', session.loginWithLink, redirectToPlanner)

page('/profile', session.touch, require('../planner-page'), function (ctx, next) {
  ctx.modal = new CommuterProfile(session)
  next()
})

page('/style-guide', require('../style-guide'))

page('/create-link', require('../create-link'))

// Allow for an easy path for resetting the user credentials and handle all unknown addresses by tracking them and redirecting to the welcome screen.

page('/welcome', trackAndRedirect)
page('/:code', trackAndRedirect)
page('/t/:code', trackAndRedirect)

// Render!

page('*', utils.render)

function trackAndRedirect (ctx, next) {
  if (!ctx.view) {
    session.logoutMiddleware(ctx, function () {
      store('registration-code', ctx.params.code)
      analytics.track('Tracking Code', {
        code: ctx.params.code
      })
      redirectToPlanner(ctx, next)
    })
  } else {
    next()
  }
}
