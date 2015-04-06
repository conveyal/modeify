/**
 * Dependencies
 */

var isLoggedIn = false
var request = require('./supertest')
var User = require('../../lib/user/model')

/**
 * Expose `info`
 */

var info = module.exports.info = {
  email: 'admin@website.com',
  password: 'passwordz',
  type: 'administrator'
}

/**
 * Expose `agent`
 */

var agent = module.exports.agent = request.agent()

/**
 * Expose `login`
 */

module.exports.login = function (done) {
  if (isLoggedIn) return done()

  User.findOrCreate(info, function (err, user) {
    if (err) return done(err)

    agent
      .post('/api/login')
      .send(info)
      .expect(200)
      .end(function (err, res) {
        if (err || res.error || !res.ok) {
          done(err || res.error || res.text)
        } else {
          isLoggedIn = true

          user.password = info.password
          module.exports.info = user

          done()
        }
      })
  })
}
