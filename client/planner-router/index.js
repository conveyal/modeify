var analytics = require('analytics')
var Commuter = require('commuter')
var CommuterProfile = require('commuter-profile')
var page = require('page')
var Plan = require('plan')
var Modal = require('modal')
var utils = require('router-utils')
var session = require('session')

var redirectToPlanner = utils.redirect('/planner')

page('*', function (ctx, next) {
  Modal.hide() // clear all modals
  next()
})

page('/', redirectToPlanner)

page('/login', require('commuter-login'))
page('/logout', session.logoutMiddleware, utils.redirect('/welcome'))
page('/forgot-password', require('forgot-password-page'))
page('/change-password/:key', require('change-password-page'))
page('/confirm-email/:key', Commuter.confirmEmail, utils.redirect('/login'))

page('/planner', session.commuterIsLoggedIn, Plan.load, require('planner-page'), require('announcements'))
page('/planner/:link', session.loginWithLink, redirectToPlanner)

page('/profile', session.commuterIsLoggedIn, Plan.load, require('planner-page'), function (ctx, next) {
  ctx.modal = new CommuterProfile({
    commuter: session.commuter(),
    plan: session.plan()
  })
  next()
})

page('/style-guide', require('style-guide'))

page('/welcome', loginAnonymously, redirectToPlanner)

/**
 * Handle all unknown addresses by tracking them and redirecting to the welcome screen
 */

page('/:code', trackAndRedirect)
page('/t/:code', trackAndRedirect)

page('*', utils.render)

function loginAnonymously (ctx, next) {
  session.loginAnonymously(next)
}

function trackAndRedirect (ctx, next) {
  if (!ctx.view) {
    loginAnonymously(ctx, function () {
      analytics.track('Tracking Code', {
        code: ctx.params.code
      })
      redirectToPlanner(ctx, next)
    })
  } else {
    next()
  }
}
