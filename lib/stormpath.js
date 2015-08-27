import stormpath from 'express-stormpath'
import path from 'path'

import analytics from './analytics'
import Commuter from './commuter/model'
import config from './config'

const VIEW_PATH = path.resolve(__dirname, '../views')

export const group = {
  admin: () => `${config.env}-administrator`,
  manager: () => `${config.env}-manager`,
  organization: id => `${config.env}-organization-${id}`,
  commuter: `${config.env}-commuter`
}

export function initializeStormpathMiddleware (app) {
  app.use('/', stormpath.init(app, {
    application: `https://api.stormpath.com/v1/applications/${config.stormpath_application}`,
    enableAccountVerification: true,
    enableAutoLogin: true,
    enableForgotPassword: true,
    expandCustomData: true,
    expandGroups: true,
    postLoginHandler: postLoginHandler,
    postRegistrationHandler: postRegistrationHandler,
    secretKey: config.secretKey,
    sessionDuration: 2592000000, // 30 days in ms

    forgotPasswordView: `${VIEW_PATH}/forgot.jade`,
    forgotPasswordChangeView: `${VIEW_PATH}/forgot_change.jade`,
    forgotPasswordChangeFailedView: `${VIEW_PATH}/forgot_change_failed.jade`,
    forgotPasswordCompleteView: `${VIEW_PATH}/forgot_complete.jade`,
    forgotPasswordEmailSentView: `${VIEW_PATH}/forgot_email_sent.jade`,
    loginView: `${VIEW_PATH}/login.jade`,
    registrationView: `${VIEW_PATH}/register.jade`,
    unauthorizedView: `${VIEW_PATH}/unauthorized.jade`,
    accountVerificationCompleteView: `${VIEW_PATH}/verification_complete.jade`,
    accountVerificationEmailSentView: `${VIEW_PATH}/verification_email_sent.jade`,
    accountVerificationFailedView: `${VIEW_PATH}/verification_failed.jade`,
    resendAccountVerificationView: `${VIEW_PATH}/verification_resend.jade`
  }))

  app.use('/', function (req, res, next) {
    req.stormpath = req.app.get('stormpathApplication')
    res.locals.user = JSON.stringify(req.user)
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
    userId: account.href.split('/').pop(),
    traits: JSON.stringify(account)
  })

  next()
}

/**
 * Create commmuter object. Add to group environment.
 */

function postRegistrationHandler (account, req, res, next) {
  Commuter
    .create({
      account: account.id
    })
    .then(() => {
      req.stormpath.getGroups({ name: group.commuter() }, (err, groups) => {
        if (err) {
          next(err)
        } else {
          groups.eachSeries((group, done) => {
            account.addToGroup(group, done)
          }, next)
        }
      })
    })
    .catch(err => {
      next(err)
    })
}
