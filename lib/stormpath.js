import expressStormpath from 'express-stormpath'
import path from 'path'
import stormpath from 'stormpath'

import analytics from './analytics'
import Commuter from './commuter/model'
import config from './config'

const DEFAULT_DIRECTORY = `${config.application.toLowerCase()}-${config.env}`
const VIEW_PATH = path.resolve(__dirname, '../views')

export const group = {
  administrator: () => `administrator`,
  manager: () => `manager`,
  organization: id => `organization-${id}`,
  commuter: () => `commuter`
}

export default expressStormpath

export function initializeStormpathMiddleware (app) {
  app.use('/', expressStormpath.init(app, {
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
    req.stormpathApplication = req.app.get('stormpathApplication')
    req.stormpathClient = req.app.get('stormpathClient')
    req.stormpathDirectory = req.app.get('stormpathDirectory')
    res.locals.user = JSON.stringify(req.user)

    if (req.stormpathDirectory) {
      next()
    } else {
      req.stormpathClient.getDirectories({ name: DEFAULT_DIRECTORY }, (err, directories) => {
        if (err) {
          next(err)
        } else {
          req.stormpathDirectory = directories.items[0]
          next()
        }
      })
    }
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
  if (!options.password) options.password = 'password'
  if (!options.givenName) options.givenName = 'None'
  if (!options.surname) options.surname = 'none'

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
      account: account.href,
      email: account.email,
      givenName: account.givenName,
      surname: account.surname
    })
    .then(() => {
      req.stormpathDirectory.getGroups({ name: group.commuter() }, (err, groups) => {
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

export function getClient () {
  return new Promise((resolve, reject) => {
    stormpath.loadApiKey(`${__dirname}/../deployment/stormpath.properties`, (err, apiKey) => {
      if (err) reject(err)
      else resolve(new stormpath.Client({apiKey}))
    })
  })
}

export function getApplication () {
  return new Promise((resolve, reject) => {
    getClient()
      .then(client => {
        client.getApplication(`https://api.stormpath.com/v1/applications/${process.env.STORMPATH_APPLICATION}`, (err, application) => {
          if (err) {
            reject(err)
          } else {
            resolve(application)
          }
        })
      })
      .catch(reject)
  })
}

export function getDefaultDirectory (client, options = {}) {
  return new Promise((resolve, reject) => {
    client.getDirectories({ name: DEFAULT_DIRECTORY }, options, (err, directories) => {
      if (err) {
        reject(err)
      } else {
        resolve(directories.items[0])
      }
    })
  })
}

export function createGroups (directory, names) {
  return Promise.all(names.map(n => {
    return new Promise((resolve, reject) => {
      directory.createGroup({
        name: n
      }, (err, group) => {
        if (err) {
          if (err.code === 2001) resolve(`Group exists for ${n}`)
          else reject(err)
        } else resolve(group)
      })
    })
  }))
}

export function authenticationRequired (req, res, next) {
  if (!req.user) {
    req.stormpathSession.destroy()
    res.status(401).send('Must be logged  in.')
  } else {
    next()
  }
}

export function groupsRequired (groups, all = false) {
  return function (req, res, next) {
    if (!req.user) {
      if (req.accepts(['html', 'json']) === 'html') {
        return res.redirect(302, '/login?next=' + encodeURIComponent(req.originalUrl))
      } else {
        return res.status(401).send('Must be logged in.')
      }
    }

    // If this user must be a member of all groups, we'll ensure that is the case
    let done = groups.length
    let safe = false

    req.user.getGroups((err, grps) => {
      if (err) {
        return res.status(404).send(err)
      }

      // Iterate through each group on the user's account, checking to see whether or not it's one of the required groups.
      grps.each((group, c) => {
        if (groups.indexOf(group.name) > -1) {
          if (!all || --done === 0) {
            safe = true
          }
        }
        c()
      }, () => {
        if (!safe) {
          if (req.accepts(['html', 'json']) === 'html') {
            res.redirect(302, '/planner')
          } else {
            res.status(401).send('Access not allowed')
          }
        } else {
          next()
        }
      })
    })
  }
}
