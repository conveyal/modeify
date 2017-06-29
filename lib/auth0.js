const jwt = require('express-jwt')
const fetch = require('isomorphic-fetch')
const moment = require('moment')
const qs = require('querystring')

require('./config')

const jwtMiddleWare = jwt({
  algorithms: ['HS256', 'RS256'],
  secret: process.env.AUTH0_SIGNING_CERTIFICATE
})

module.exports.adminRequired = function adminRequired (req, res, next) {
  if (!req.user || !req.user.app_metadata || !req.user.app_metadata.isAdmin) {
    res.status(401).send('Unauthorized')
  } else {
    next()
  }
}

// authenticationOptional is additional middleware that catches any error
// from the jwtMiddleWare and simply continues.  If the user existed, they'll
// be present in req.user, otherwise things simply continue
module.exports.authenticationOptional = (maybeError, req, res, next) => { next() }
module.exports.authenticateUser = jwtMiddleWare

let managementAPIAccessToken
let managementAPIAccessTokenExpirationTime

module.exports.getAccounts = function (params, callback) {
  function getUsers () {
    fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users?${qs.stringify(params)}`, {
      headers: {
        authorization: `Bearer ${managementAPIAccessToken}`,
        'content-type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        callback(null, json)
      })
      .catch(callback)
  }

  // get API token for management API if needed
  if (managementAPIAccessToken &&
    moment.isMoment(managementAPIAccessTokenExpirationTime) &&
    managementAPIAccessTokenExpirationTime.isAfter(moment())
  ) {
    getUsers()
  } else {
    fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_NON_INTERACTIVE_CLIENT_ID,
        client_secret: process.env.AUTH0_NON_INTERACTIVE_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.access_token) {
          console.error(json)
          callback(new Error('error connecting to Auth0 Management API'))
        } else {
          console.log('received access to management api')
          managementAPIAccessToken = json.access_token
          managementAPIAccessTokenExpirationTime = moment().add(json.expires_in, 'seconds')
          getUsers()
        }
      })
      .catch(callback)
  }
}
