/* global before, describe, it */

var admin = require('./default-admin')
var cleardb = require('./cleardb')
var commuter = require('./default-commuter')
var request = require('./supertest')

/**
 * Mocha
 */

describe('/api/auth', function () {
  before(cleardb)
  before(admin.login)
  before(commuter.create)

  describe('POST /login', function () {
    var agent = request.agent()

    it('404 with no email or password', function (done) {
      request.post('/api/login')
        .expect(404, done)
    })

    it('404 with a non-existing email', function (done) {
      request
        .post('/api/login')
        .send({
          email: 'fakeemailz@gmail.com'
        })
        .expect(404, done)
    })

    it('400 for an existing email but incorrect password', function (done) {
      request
        .post('/api/login')
        .send({
          email: admin.info.email,
          password: 'password'
        })
        .expect(400, done)
    })

    it('should return 200 for a correct email and password', function (done) {
      agent
        .post('/api/login')
        .send(admin.info)
        .expect(200, done)
    })

    it('401 with no cookie passed', function (done) {
      request
        .get('/api/is-logged-in')
        .expect(401, done)
    })

    it('200 wth a cookie passed', function (done) {
      agent
        .get('/api/is-logged-in')
        .expect(200, done)
    })

    it('401 for commuter-is-logged-in', function (done) {
      agent
        .get('/api/commuter-is-logged-in')
        .expect(401, done)
    })
  })

  describe('GET /logout', function () {
    var agent = request.agent()

    it('204', function (done) {
      agent
        .get('/api/logout')
        .expect(204, done)
    })

    it('401 after logout', function (done) {
      agent
        .get('/api/is-logged-in')
        .expect(401, done)
    })
  })

  describe('GET /login-anonymously', function () {
    var agent = request.agent()

    it('200 create a user and log you in', function (done) {
      agent
        .get('/api/login-anonymously')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          res.body.anonymous.should.equal(true)
          done()
        })
    })

    it('200 from commuter-is-logged-in', function (done) {
      agent
        .get('/api/commuter-is-logged-in')
        .expect(200, done)
    })

    it('401 from is-logged-in', function (done) {
      agent
        .get('/api/is-logged-in')
        .expect(401, done)
    })
  })

  describe('GET /commuter-login', function () {
    var agent = request.agent()

    it('400 for invalid email', function (done) {
      request
        .post('/api/commuter-login')
        .send({
          email: 'fakeemailz@fakesy.com'
        })
        .expect(400, done)
    })

    it('200 login for correct commuter credentials', function (done) {
      agent
        .post('/api/commuter-login')
        .send({
          email: commuter.info._user.email,
          password: 'password'
        })
        .expect(200, done)
    })

    it('400 for invalid password', function (done) {
      request
        .post('/api/commuter-login')
        .send({
          email: commuter.info._user.email,
          password: 'wrongpassword'
        })
        .expect(400, done)
    })

    it('200 from commuter-is-logged-in', function (done) {
      agent
        .get('/api/commuter-is-logged-in')
        .expect(200, done)
    })
  })

  describe('GET /login/:link', function () {
    var agent = request.agent()

    it('200 login with correct link', function (done) {
      agent
        .get('/api/login/' + commuter.info.link)
        .expect(200, done)
    })

    it('200 for commuter-is-logged-in after loggin in with the link',
      function (done) {
        agent
          .get('/api/commuter-is-logged-in')
          .expect(200, done)
      })

    it('404 with invalid link', function (done) {
      request
        .get('/api/login/asdfafdsf')
        .expect(404, done)
    })
  })
})
