var analytics = require('analytics')
var store = require('browser-store')
var Commuter = require('commuter')
var log = require('./client/log')('session')
var defaults = require('model-defaults')
var model = require('model')
var page = require('page')
var Plan = require('plan')
var request = require('./client/request')
var User = require('user')

/**
 * Deafult session settings
 */

var DEFAULT_SETTINGS = {}

/**
 * Session
 */

var Session = model('Session')
  .use(defaults({
    commuter: null,
    loaded: false,
    plan: null,
    settings: {},
    user: null,
    isAdmin: false,
    isLoggedIn: false,
    isManager: false
  }))
  .attr('commuter')
  .attr('loaded')
  .attr('plan')
  .attr('settings')
  .attr('user')
  .attr('isAdmin')
  .attr('isLoggedIn')
  .attr('isManager')

/**
 * Save settings on changes
 */

Session.on('change settings', function (session, settings) {
  store('session', settings)
})

/**
 * Logout
 */

Session.prototype.logout = function (next) {
  log('--> logging out')

  this.clear()
  request.get('/auth/logout', function (err, res) {
    log('<-- logged out %s', res.text)
    if (next) next(err, res)
  })
}

Session.prototype.clear = function () {
  store('commuter', null)
  store('plan', null)
  store('session', null)
  store('user', null)

  document.cookie = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'

  session.set({
    commuter: null,
    isAdmin: false,
    isLoggedIn: false,
    isManager: false,
    loaded: false,
    plan: null,
    settings: {},
    user: null
  })
}

/**
 * Expose `session`
 */

var session = window.session = module.exports = new Session()

/**
 * Touch.
 */

session.touch = function (ctx, next) {
  ctx.session = session
  if (session.loaded()) {
    next(null, session)
  } else {
    session.load(ctx, next)
  }
}

session.load = function (ctx, next) {
  session.settings(store('session') || DEFAULT_SETTINGS)

  loadUser(function (err, user) {
    if (err) return next(err)

    if (user) {
      session.user(user)
      session.isLoggedIn(true)

      analytics.identify(user.id(), user.toJSON())

      user.on('change', function () {
        store('user', user.toJSON())
      })
    } else {
      session.user(null)
      session.isLoggedIn(false)
    }

    loadCommuter(function (err, commuter) {
      if (err) return next(err)

      // store the commuter
      session.commuter(commuter)

      // load the plan
      session.plan(Plan.load())

      // set the session as loaded
      session.loaded(true)

      // Store commuter changes
      commuter.on('change', function () {
        store('commuter', commuter.toJSON())

        if (!commuter.anonymous()) {
          commuter.save()
        }
      })

      next(null, session)
    })
  })
}

function loadUser (next) {
  var userData = store('user')

  if (session.user()) {
    next(null, session.user())
  } else if (userData) {
    next(null, new User(userData))
  } else if (window.USER) {
    next(null, new User(window.USER))
  } else {
    next()
  }
}

function loadCommuter (next) {
  var commuterData = store('commuter')
  var user = session.user()

  if (session.commuter()) {
    next(null, session.commuter())
  } else if (commuterData) {
    if (user) {
      commuterData.account = user.id()
      commuterData.anonymous = false
    }

    next(null, new Commuter(commuterData))
  } else if (session.isLoggedIn()) {
    request.get('/commuter', {
      account: session.user().id()
    }, function (err, res) {
      if (err || !res.body) {
        var commuter = new Commuter({
          account: session.user().id(),
          anonymous: false
        })
        next(null, commuter)
      } else {
        next(null, new Commuter(res.body))
      }
    })
  } else {
    next(null, new Commuter({
      anonymous: true
    }))
  }
}

/**
 * Log in with link middleware.
 * TODO: Fix this.
 */

session.loginWithLink = function (ctx, next) {
  log('--> logging in with link %s', ctx.params.link)
  request.get('/login/' + ctx.params.link, function (err, res) {
    if (res.ok && res.body) {
      session.login(res.body)
      log('<-- successfully logged in with link')
      next()
    } else {
      log.warn('<-- failed to login with link: %e', err)
      next(err || new Error(res.text))
    }
  })
}

/**
 * Log out
 */

session.logoutMiddleware = function (ctx, next) {
  log('logout %s', decodeURIComponent(ctx.path))

  session.logout(next)
}

/**
 * Check if admin
 */

session.checkIfAdmin = function (ctx, next) {
  log('is admin %s', decodeURIComponent(ctx.path))
  var groups = ctx.session.user().groups()

  if (groups.indexOf('administrator') === -1) {
    page('/manager/organizations')
  } else {
    next()
  }
}

/**
 * Check if manager
 */

session.checkIfManager = function (ctx, next) {
  log('is manager %s', ctx.path)
  var groups = ctx.session.user().groups()

  if (groups.indexOf('manager') === -1) {
    window.location.href = '/login'
  } else {
    next()
  }
}
