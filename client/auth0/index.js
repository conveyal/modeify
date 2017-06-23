const Auth0Lock = require('auth0-lock').default

const store = require('../browser-store')
const session = require('../session')
const User = require('../user')

let loginCallback

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
  store('auth0IdToken', authResult.idToken)
  lock.getProfile(authResult.idToken, function (error, profile) {
    if (error) {
      // Handle error
      if (typeof loginCallback === 'function') {
        loginCallback(error)
      }
      return
    }

    console.log('logged in w/ Auth0!')

    // update user stuff
    const user = new User(profile)
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

    if (typeof loginCallback === 'function') {
      loginCallback()
    }
  })
})

lock.on('authorization_error', function (err) {
  console.error(err)
})

module.exports.setLoginCallback = function (callback) {
  loginCallback = callback
}

module.exports.show = function () {
  lock.show()
}
