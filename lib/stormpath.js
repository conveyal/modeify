import stormpath from 'express-stormpath'

import analytics from './analytics'
import config from './config'

export function initializeMiddleware (app) {
  app.use('/', stormpath.init(app, {
    application: `https://api.stormpath.com/v1/applications/${config.stormpath_application}`,
    enableAccountVerification: true,
    enableAutoLogin: true,
    enableForgotPassword: true,
    expandCustomData: true,
    expandGroups: true,
    postLoginHandler: postLoginHandler,
    secretKey: config.cookieSecret,
    sessionDuration: 2592000000 // 30 days in ms
  }))

  app.use('/', function (req, res, next) {
    req.stormpath = req.app.get('stormpathApplication')
    next()
  })

  app.get('/api/auth/is-logged-in', function (req, res) {
    if (req.user) {
      res.status(200).send(req.user)
    } else {
      res.status(401).end()
    }
  })

  app.get('/api/auth/login-with-link/:link', function (req, res) {
    res.status(200).end()
  })

  app.get('/api/auth/logout', function (req, res) {
    req.stormpathSession.destroy()
    res.status(204).end()
  })
}

export function createAccount (stormpath, options) {
  return new Promise((resolve, reject) => {
    stormpath.createAccount(options, (err, createdAccount) => {
      if (err) {
        reject(err)
      } else {
        resolve(createdAccount)
      }
    })
  })
}

export function populateAccounts (stormpath, collection, attribute) {
  return Promise.all(collection.map(resource => populateAccount(stormpath, resource, attribute)))
}

export function populateAccount (stormpath, resource, attribute) {
  if (!resource[attribute] || resource[attribute].length < 1) {
    return Promise.resolve(resource)
  }

  return new Promise((resolve, reject) => {
    stormpath.getAccount(resource[attribute], { expand: 'customData' }, (err, account) => {
      if (err) {
        reject(err)
      } else {
        resource[`_${attribute}`] = account // Set it on a similar value, but don't override the id
        resolve(resource)
      }
    })
  })
}

function postLoginHandler (account, req, res, next) {
  analytics.identify({
    userId: account.id,
    traits: JSON.stringify(account)
  })

  next()
}
