const auth0 = require('auth0-js')
const Auth0Lock = require('auth0-lock').default
const decodeJwt = require('jwt-decode')
const uuidv4 = require('uuid/v4')

const config = require('../config')
const message = require('../messages')('login')

let loginCallback

const auth0client = new auth0.WebAuth({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID
})

const lock = new Auth0Lock(
  process.env.AUTH0_CLIENT_ID,
  process.env.AUTH0_DOMAIN,
  {
    auth: {
      redirect: false,
      params: {
        scope: 'app_metadata profile email openid user_metadata'
      }
    },
    autoclose: true,
    languageDictionary: {
      title: message('title')
    },
    ...config.lock()
  }
)

lock.on('authenticated', function (authResult) {
  if (typeof loginCallback === 'function') {
    loginCallback(null, authResult)
  }
})

lock.on('authorization_error', function (err) {
  console.error(err)
})

module.exports.getProfile = function (idToken, callback) {
  lock.getProfile(idToken, callback)
}

module.exports.renewAuth = function (callback) {
  const nonce = uuidv4()
  auth0client.renewAuth({
    audience: '',
    nonce,
    postMessageDataType: 'auth0:silent-authentication',
    redirectUri: window.location.origin + '/auth/silent-callback',
    scope: 'openid app_metadata user_metadata email profile',
    usePostMessage: true
  }, (err, authResult) => {
    if (err) {
      console.log('Failed to renew log in.')
      callback(err)
    } else if (!authResult.idToken) {
      const err = new Error('idToken not received from auth0')
      console.log(authResult)
      callback(err)
    } else if (decodeJwt(authResult.idToken).nonce !== nonce) {
      const err = new Error('Nonce string does not match!')
      callback(err)
    } else {
      console.log('renewed auth successfully!')
      callback(null, authResult)
    }
  })
}

module.exports.show = function (callback) {
  loginCallback = callback
  lock.show()
}
