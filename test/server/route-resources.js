/* global before, describe, it */

var async = require('async')
var base = '/api/route-resources'
var supertest = require('./supertest')
var RouteResources = require('../../lib/route-resource/model')
var resources = require('../fixtures/route-resources')

var agent = supertest.agent()

describe(base, function () {
  before(function (done) {
    RouteResources.remove({}, done)
  })

  before(function (done) {
    async.each(resources, function (resource, done) {
      RouteResources.create(resource, done)
    }, done)
  })

  describe('GET /', function () {
    it('should get all with no parameters given', function (done) {
      agent
        .get(base)
        .expect(200)
        .end(function (err, res) {
          res.body.length.should.eql(3)
          done(err)
        })
    })

    describe('?tags=', function () {
      it('should get all for walk,bicycle,arlington,loudon', function (done) {
        agent
          .get(base)
          .query({
            tags: 'walk,bicycle,arlington,loudon'
          })
          .expect(200)
          .end(function (err, res) {
            res.body.length.should.eql(3)
            done(err)
          })
      })

      it('should get two for bicycle,arlington', function (done) {
        agent
          .get(base)
          .query({
            tags: 'bicycle,arlington'
          })
          .expect(200)
          .end(function (err, res) {
            res.body.length.should.eql(2)
            done(err)
          })
      })

      it('should get 0 for walk,princegeorge', function (done) {
        agent
          .get(base)
          .query({
            tags: 'walk,princegeorge'
          })
          .expect(200)
          .end(function (err, res) {
            res.body.length.should.eql(0)
            done(err)
          })
      })
    })
  })
})
