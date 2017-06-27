const auth0 = require('auth0-js')
const Auth0Lock = require('auth0-lock').default

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
        scope: 'app_metadata email openid user_metadata'
      }
    },
    autoclose: true
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
  auth0client.renewAuth({
    audience: '',
    postMessageDataType: 'auth0:silent-authentication',
    redirectUri: window.location.origin + '/auth/silent-callback',
    scope: 'openid app_metadata user_metadata',
    usePostMessage: true
  }, (err, authResult) => {
    if (err) {
      console.log('Failed to renew log in.')
      return callback(err)
    }

    if (!authResult.idToken) {
      const err = new Error('idToken not received from auth0')
      console.log(authResult)
      return callback(err)
    }

    lock.getProfile(authResult.idToken, callback)
  })
}

module.exports.setLoginCallback = function (callback) {
  loginCallback = callback
}

module.exports.show = function (callback) {
  loginCallback = callback
  lock.show()
}
