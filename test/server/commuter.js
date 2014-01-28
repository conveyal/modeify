/**
 * Dependencies
 */

var commuter = require('./default-commuter');
var org = require('./default-organization');
var user = require('./default-user');
var request = require('./supertest');

/**
 * Base URL
 */

var base = '/api/commuters';

/**
 * BDD
 */

describe(base, function() {
  before(user.login);
  before(org.create);

  describe('GET /', function() {
    it('401 if not logged in', function(done) {
      request
        .get(base)
        .expect(401, done);
    });

    it('200 with list of all commuters', function(done) {
      request
        .get(base)
        .set('cookie', user.sid)
        .expect(200, done);
    });
  });

  describe('POST /', function() {
    it('401 if not logged in', function(done) {
      request
        .post(base)
        .expect(401, done);
    });

    it('400 if invalid data', function(done) {
      request
        .post(base)
        .set('cookie', user.sid)
        .send({})
        .expect(400, done);
    });

    it('201 if correct data', function(done) {
      commuter.info._organization = org.info._id;
      request
        .post(base)
        .set('cookie', user.sid)
        .send(commuter.info)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          commuter.info = res.body;
          done();
        });
    });
  });

  describe('PUT /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .put(base + '/' + commuter.info._id)
        .expect(401, done);
    });

    it('204 if updated correctly', function(done) {
      request
        .put(base + '/' + commuter.info._id)
        .set('cookie', user.sid)
        .send(commuter.info)
        .expect(204, done);
    });
  });

  describe('DELETE /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .del(base + '/' + commuter.info._id)
        .expect(401, done);
    });

    it('204 if deleted correctly', function(done) {
      request
        .del(base + '/' + commuter.info._id)
        .set('cookie', user.sid)
        .expect(204, done);
    });
  });
});
