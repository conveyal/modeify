var cookieSession = require('cookie-session')
var express = require('express')
var toSlugCase = require('to-slug-case')
var uuid = require('node-uuid')

var config = require('../config')
var Commuter = require('../commuter/model')
var User = require('../user/model')

var slug = toSlugCase(config.application)

var cookieKey = slug + '.' + process.env.NODE_ENV
var cookieSecret = process.env.COOKIE_SECRET + '.' + cookieKey
var thirtyDays = 2592000000 // 30 days in ms

var app = module.exports = express.Router()
  .use(cookieSession({
    httpOnly: false,
    key: cookieKey,
    maxage: thirtyDays,
    rolling: true,
    secret: cookieSecret
  }))
  .use(function nocache (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
  })

  /**
   * Expose `isAdmin`, `isLoggedIn`
   */

module.exports.isAdmin = isAdmin
module.exports.isManager = isManager
module.exports.isLoggedIn = isLoggedIn
module.exports.commuterIsLoggedIn = hasCommuter

/**
 * Login
 */

app.post('/login', function (req, res) {
  User
    .findOne()
    .where('email', req.body.email)
    .select('email email_confirmed password type')
    .exec(function (err, user) {
      if (err) {
        res.status(400).send(err)
      } else if (!user) {
        res.status(404).send('Incorrect email.')
      } else {
        user.comparePassword(req.body.password, function (err, same) {
          if (err) {
            res.status(400).send(err)
          } else if (!same) {
            res.status(400).send('Incorrect password.')
          } else {
            // convert to JSON and delete password
            user = user.toJSON()
            delete user.password

            // save in session
            req.session.user = user
            res.status(200).send(user)
          }
        })
      }
    })
})

/**
 * Commuter Login
 */

app.post('/commuter-login', function (req, res) {
  User
    .findOne()
    .where('email', req.body.email)
    .select('email email_confirmed password type')
    .exec(function (err, user) {
      if (err) {
        res.status(400).send(err)
      } else if (!user) {
        res.status(400).send("Commuter doesn't exist for that email.")
      } else {
        user.comparePassword(req.body.password, function (err, same) {
          if (err || !same) {
            res.status(400).send('Incorrect password.')
          } else {
            Commuter
              .findOne()
              .where('_user', user._id)
              .populate('_user', 'email email_confirmed type')
              .exec(function (err, commuter) {
                if (err) {
                  res.status(400).send(err)
                } else if (!commuter) {
                  // If there's a user account but no commuter, create one!
                  Commuter
                    .create({
                      anonymous: false,
                      _user: user._id
                    }, function (err, commuter) {
                      if (err) {
                        res.status(400).send(err)
                      } else {
                        req.session.user = user.toJSON()
                        req.session.commuter = commuter.toJSON()

                        res.status(200).send(commuter.toJSON())
                      }
                    })
                } else {
                  req.session.user = commuter._user.toJSON()
                  req.session.commuter = commuter.toJSON()

                  res.status(200).send(commuter.toJSON())
                }
              })
          }
        })
      }
    })
})

/**
 * Login with link
 */

app.get('/login/:link', function (req, res) {
  Commuter
    .findOne()
    .where('link', req.params.link)
    .populate('_user', 'email email_confirmed type')
    .exec(function (err, commuter) {
      if (err) {
        res.status(400).send(err)
      } else if (!commuter) {
        res.status(404).send('Incorrect link.')
      } else {
        req.session.user = commuter._user && commuter._user.toJSON()
        req.session.commuter = commuter.toJSON()

        res.status(200).send(commuter.toJSON())
      }
    })
})

/**
 * Login anonymously
 */

app.get('/login-anonymously', function (req, res) {
  var email = 'anonymous' + uuid.v4().replace(/-/g, '') + '@' + config.domain

  Commuter.generate({
    email: email
  }, {
    anonymous: true
  }, function (err, commuter) {
    if (err) {
      res.status(400).send(err)
    } else {
      req.session.user = commuter._user.toJSON()
      req.session.commuter = commuter.toJSON()

      delete req.session.user.password
      delete req.session.commuter._user.password

      res.status(200).send(commuter.toJSON())
    }
  })
})

/**
 * Logout
 */

app.all('/logout', logout, function (req, res) {
  res.status(204).end()
})

/**
 * Check if logged in
 */

app.all('/is-logged-in', isLoggedIn, isManager, function (req, res) {
  res.status(200).send(req.session.user)
})

/**
 * Commuter is logged in?
 */

app.all('/commuter-is-logged-in', isLoggedIn, hasCommuter, function (req, res) {
  res.status(200).send(req.session.commuter)
})

/**
 * Check if a user is logged in
 */

function isLoggedIn (req, res, next) {
  if (req.session.user || req.session.commuter) {
    next()
  } else {
    logout(req, res)
    res.status(401).send('Must be logged in.')
  }
}

/**
 * Has Commuter
 */

function hasCommuter (req, res, next) {
  if (req.session.commuter) {
    next()
  } else {
    res.status(401).send('No commuter.')
  }
}

/**
 * Is manager?
 */

function isManager (req, res, next) {
  if (req.session && req.session.user && req.session.user.type !== 'commuter') {
    next()
  } else {
    res.status(401).send('Managers only.')
  }
}

/**
 * Is admin?
 */

function isAdmin (req, res, next) {
  if (req.session && req.session.user && req.session.user.type ===
    'administrator') {
    next()
  } else {
    res.status(401).send('Administrators only.')
  }
}

/**
 * Logout
 */

function logout (req, res, next) {
  res.clearCookie('commuter')
  res.clearCookie('user')
  res.clearCookie()
  req.session = null
  if (next) next()
}
