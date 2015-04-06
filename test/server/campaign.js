/* global before, describe, it */

var user = require('./default-admin')
var campaign = require('./default-campaign')
var org = require('./default-organization')
var request = require('./supertest')

/**
 * Base URL
 */

var base = '/api/campaigns'

/**
 * BDD
 */

describe(base, function () {
  before(user.login)
  before(org.create)

  describe('GET /', function () {
    it('401 if not logged in', function (done) {
      request
        .get(base)
        .expect(401, done)
    })

    it('200 if logged in', function (done) {
      user.agent
        .get(base)
        .expect(200, done)
    })
  })

  describe('POST /', function () {
    it('401 if not logged in', function (done) {
      request
        .post(base)
        .expect(401, done)
    })

    it('400 if invalid data', function (done) {
      user.agent
        .post(base)
        .send(campaign.info)
        .expect(400, done)
    })

    it('201 if logged in & correct data', function (done) {
      campaign.info._organization = org.info._id
      user.agent
        .post(base)
        .send(campaign.info)
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err)
          campaign.info = res.body
          done()
        })
    })
  })

  describe('PUT /:id', function () {
    it('401 if not logged in', function (done) {
      request
        .put(base + '/' + campaign.info._id)
        .expect(401, done)
    })

    it('404 if id does not exist', function (done) {
      user.agent
        .put(base + '/52e7ecb9e023120000c33697')
        .expect(404, done)
    })

    it('204 if logged in', function (done) {
      user.agent
        .put(base + '/' + campaign.info._id)
        .expect(204, done)
    })
  })

  describe('GET /:id/send', function () {
    it('204 if it has not been sent', function (done) {
      user.agent
        .get(base + '/' + campaign.info._id + '/send')
        .expect(204, done)
    })
  })

  describe('DELETE /:id', function () {
    it('401 if not logged in', function (done) {
      request
        .del(base + '/' + campaign.info._id)
        .expect(401, done)
    })

    it('404 if id does not exist', function (done) {
      user.agent
        .del(base + '/52e7ecb9e023120000c33697')
        .expect(404, done)
    })

    it('204 if logged in', function (done) {
      user.agent
        .del(base + '/' + campaign.info._id)
        .expect(204, done)
    })
  })
})
