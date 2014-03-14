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
      user.agent
        .get(base)
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
      user.agent
        .post(base)
        .send({})
        .expect(400, done);
    });

    it('201 if correct data', function(done) {
      commuter.info._organization = org.info._id;
      user.agent
        .post(base)
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

    it('404 if id does not exist', function(done) {
      user.agent
        .put(base + '/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if updated correctly', function(done) {
      user.agent
        .put(base + '/' + commuter.info._id)
        .send(commuter.info)
        .expect(204, done);
    });
  });

  describe('POST /:id/send-plan', function() {
    it('401 if not logged in', function(done) {
      request
        .post(base + '/' + commuter.info._id + '/send-plan')
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      user.agent
        .post(base + '/52e7ecb9e023120000c33697/send-plan')
        .expect(404, done);
    });

    it('201 if sent correctly and return email object', function(done) {
      user.agent
        .post(base + '/' + commuter.info._id + '/send-plan')
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          res.body._commuter.should.eql(commuter.info._id);
          res.body._organization.should.eql(commuter.info._organization);
          done();
        });
    });
  });

  describe('DELETE /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .del(base + '/' + commuter.info._id)
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      user.agent
        .del(base + '/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if deleted correctly', function(done) {
      user.agent
        .del(base + '/' + commuter.info._id)
        .expect(204, done);
    });
  });
});
