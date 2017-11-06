var model = require('component-model')
var moment = require('moment')

var analytics = require('../analytics')
const auth0 = require('../auth0')
var store = require('../browser-store')
var Commuter = require('../commuter')
var log = require('../log')('session')
var defaults = require('../components/segmentio/model-defaults/0.2.0')
var Plan = require('../plan')
var request = require('../request')
var User = require('../user')

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

  next()
}

Session.prototype.clear = function () {
  store('auth0IdToken', null)
  store('commuter', null)
  store('plan', null)
  store('session', null)
  store('user', null)

  request.setAuthHeader(null)

  document.cookie = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'

  session.set({
    commuter: null,
    isLoggedIn: false,
    loaded: false,
    plan: null,
    settings: {},
    user: null
  })

  this.isLoggedIn(false)
  this.emit('change email', null)
  this.emit('change places', [])
}

Session.prototype.isAdmin = function () {
  return this.isLoggedIn() && this.user().app_metadata()['isAdmin']
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

  loadUser(function (err) {
    if (err) return next(err)

    const user = session.user()

    if (user) {
      var userJson = user.toJSON()
      var registrationCode = store('registration-code')

      if (registrationCode) {
        userJson.registrationCode = registrationCode
        store('registration-code', null)
      }

      analytics.identify(user.user_id(), userJson)

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
      var userOpts = (session.user() && session.user().user_metadata().modeify_opts)
        ? session.user().user_metadata().modeify_opts
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
        if (err) {
          console.log('error loading service alerts', err)
        }

        const today = moment()
        alerts = (alerts || []).filter(function (alert) {
          const fromDate = moment.utc(alert.fromDate)
          const toDate = moment.utc(alert.toDate)
          return !fromDate.isAfter(today, 'days') && !toDate.isBefore(today, 'days')
        })

        session.serviceAlerts(alerts)
      })

      next(null, session)
    })
  })
}

session.login = function (callback) {
  auth0.show(makeAuthResponseHandler(true, callback))
}

session.loginWithLink = function (ctx, next) {
  next()
}

/**
 * Log out
 */

session.logoutMiddleware = function (ctx, next) {
  log('logout %s', decodeURIComponent(ctx.path))

  session.logout(next)
}

session.signUp = function () {
  auth0.show({ initialScreen: 'signUp' }, makeAuthResponseHandler(true))
}

function makeAuthResponseHandler (alertIfFailed, callback) {
  return (authErr, authResult) => {
    const idToken = authResult ? authResult.idToken : null
    if (authErr || !idToken) {
      store('auth0IdToken', null)
      if (alertIfFailed) {
        window.alert('Failed to login')
      }
      if (typeof callback === 'function') {
        callback(authErr || new Error('Failed to obtain idToken'))
      }
      console.error(authErr || 'Failed to obtain idToken')
      return
    }

    store('auth0IdToken', idToken)
    request.setAuthHeader(idToken)

    auth0.getProfile(idToken, (getProfileError, profile) => {
      if (getProfileError) {
        if (alertIfFailed) {
          window.alert('Failed to login')
        }
        if (typeof callback === 'function') {
          callback(getProfileError)
        }
        console.error(getProfileError)
        return
      }

      const user = new User(profile)

      // make sure new users have their createdAtUnix field set
      const userMetadata = user.user_metadata() || {}
      if (!userMetadata.createdAtUnix) {
        userMetadata.createdAtUnix = moment(profile.created_at).unix()
        user.user_metadata(userMetadata)
        user.saveUserMetadata(() => {})
      }

      session.user(user)
      session.isLoggedIn(true)
      session.emit('change email', session.user().email())
      session.emit('change places', session.user().user_metadata().modeify_places)

      store('user', user.toJSON())

      // update advancedSettings if present in user data
      // the plan might not be loaded when logging into manager app, so skip in that case
      if (profile.user_metadata && profile.user_metadata.modeify_opts && session.plan()) {
        const advancedSettings = [
          'bikeSpeed',
          'bikeTrafficStress',
          'carCostPerMile',
          'carParkingCost',
          'maxBikeTime',
          'maxWalkTime',
          'walkSpeed'
        ]

        advancedSettings.forEach((setting) => {
          const settingValue = profile.user_metadata.modeify_opts[setting]
          if (settingValue || settingValue === 0) {
            session.plan()[setting](settingValue)
          }
        })

        session.plan().store()
      }

      if (typeof callback === 'function') {
        callback()
      }
    })
  }
}

function loadUser (next) {
  if (session.user()) {
    // webapp is already initiated?
    return next(null, session.user())
  }

  const idToken = store('auth0IdToken')

  if (!idToken) {
    return next()
  }

  // initiate refresh of user data
  auth0.renewAuth(makeAuthResponseHandler(false, next))
}

function loadCommuter (next) {
  var commuterData = store('commuter')
  var user = session.user()

  if (session.commuter()) {
    next(null, session.commuter())
  } else if (commuterData) {
    if (user) {
      commuterData.anonymous = false
    }

    next(null, new Commuter(commuterData))
  } else if (session.isLoggedIn()) {
    request.get('/commuters', {
      account: user.getAccountId()
    }, function (err, res) {
      if (err || !res.body || res.body.length === 0) {
        next(null, new Commuter({
          account: user.getAccountId(),
          email: user.email(),
          givenName: 'unknown',
          surname: 'unknown',
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
