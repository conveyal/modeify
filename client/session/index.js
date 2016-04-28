var analytics = require('analytics')
var store = require('browser-store')
var Commuter = require('commuter')
var log = require('./client/log')('session')
var defaults = require('model-defaults')
var model = require('model')
var page = require('page')
var Plan = require('plan')
var request = require('./client/request')
var superagent = require('superagent')
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
    isLoggedIn: false
  }))
  .attr('commuter')
  .attr('loaded')
  .attr('plan')
  .attr('settings')
  .attr('user')
  .attr('isLoggedIn')
  .attr('serviceAlerts')

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
  superagent
    .post('/logout')
    .end(function (err, res) {
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
    isLoggedIn: false,
    loaded: false,
    plan: null,
    settings: {},
    user: null
  })
}

Session.prototype.isAdmin = function () {
  return this.inGroups(['administrator'])
}

Session.prototype.isManager = function () {
  return this.inGroups(['administrator', 'manager'])
}

Session.prototype.inGroups = function (groups, all) {
  return this.isLoggedIn() && this.user().inGroups(groups, all)
}

/**
 * Expose singleton `session`
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

      var userJson = user.toJSON()
      var registrationCode = store('registration-code')

      if (registrationCode) {
        userJson.registrationCode = registrationCode
        store('registration-code', null)
      }

      analytics.identify(user.href().split('/').pop(), userJson)

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
      var userOpts = (session.user() && session.user().customData().modeify_opts)
        ? session.user().customData().modeify_opts
        : {}
      session.plan(Plan.load(userOpts))

      // set the session as loaded
      session.loaded(true)

      // Store commuter changes
      commuter.on('change', function () {
        store('commuter', commuter.toJSON())

        if (!commuter.anonymous()) {
          commuter.save()
        }
      })

      // check for alerts
      loadServiceAlerts(function (err, alerts) {
        console.log('>> got alerts ', alerts);
        session.serviceAlerts(alerts)
        next(null, session)
      })

    })
  })
}

session.groupsRequired = function (groups, all) {}

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
      commuterData.account = user.href()
      commuterData.anonymous = false
    }

    next(null, new Commuter(commuterData))
  } else if (session.isLoggedIn()) {
    request.get('/commuters', {
      account: user.href()
    }, function (err, res) {
      if (err || !res.body || res.body.length === 0) {
        next(null, new Commuter({
          account: user.href(),
          email: user.email(),
          givenName: user.givenName(),
          surname: user.surname(),
          anonymous: false
        }))
      } else {
        next(null, new Commuter(res.body[0]))
      }
    })
  } else {
    next(null, new Commuter({
      anonymous: true
    }))
  }
}

function loadServiceAlerts (next) {
  request.get('/service-alerts', function (err, res) {
    if (err || !res.body || res.body.length === 0) {
      next(null, [])
    } else {
      next(null, res.body)
    }
  })
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
