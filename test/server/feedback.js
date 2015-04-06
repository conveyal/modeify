/* global before, describe, it */

var admin = require('./default-admin')
var request = require('./supertest')

var agent = request.agent()

describe('/api/feedback', function () {
  before(admin.login)
  before(function (done) {
    agent
      .get('/api/login-anonymously')
      .expect(200, done)
  })

  describe('GET /', function () {
    it('200 if manager', function (done) {
      admin.agent
        .get('/api/feedback')
        .expect(200, done)
    })

    it('401 if not manager', function (done) {
      agent
        .get('/api/feedback')
        .expect(401, done)
    })
  })

  describe('POST /', function () {
    it('401 if not logged in', function (done) {
      request
        .post('/api/feedback')
        .send({})
        .expect(401, done)
    })

    it('200 if commuter', function (done) {
      agent
        .post('/api/feedback')
        .send({
          feedback: 'Whatevr',
          plan: {},
          results: []
        })
        .expect(200, done)
    })
  })
})
