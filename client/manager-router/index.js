var ServiceAlert = require('../service-alert')

var p = require('page')
var session = require('../session')
var utils = require('../router-utils')

// Setup & show alerts

p('*', function (ctx, next) {
  ctx.manager = true
  next()
}, require('../alerts'))

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.touch, utils.redirect('/welcome'))

// Public links

p('/logout', session.logoutMiddleware, function () {
  window.location.href = '/manager'
})

// Welcome new Manager

p('/welcome', session.touch, require('../welcome-manager'))

// Feedback

p('/feedback', session.touch, require('../feedback-table-page'))

// User Signups

p('/user-activity', session.touch, require('../user-activity-page'))

// Alerts

p('/alerts', session.touch, ServiceAlert.loadAll, require('../service-alerts-page'))

// Render all

p('*', utils.render)
