/**
 * Dependencies
 */

var campaign = require('./default-campaign');
var org = require('./default-organization');
var user = require('./default-user');
var request = require('./supertest');

/**
 * Base URL
 */

var base = '/api/campaigns';

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

    it('200 if logged in', function(done) {
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
        .send(campaign.info)
        .expect(400, done);
    });

    it('201 if logged in & correct data', function(done) {
      campaign.info._organization = org.info._id;
      request
        .post(base)
        .set('cookie', user.sid)
        .send(campaign.info)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          campaign.info = res.body;
          done();
        });
    });
  });

  describe('PUT /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .put(base + '/' + campaign.info._id)
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      request
        .put(base + '/52e7ecb9e023120000c33697')
        .set('Cookie', user.sid)
        .expect(404, done);
    });

    it('204 if logged in', function(done) {
      request
        .put(base + '/' + campaign.info._id)
        .set('cookie', user.sid)
        .expect(204, done);
    });
  });

  describe('GET /:id/send', function() {
    it('204 if it has not been sent', function(done) {
      request
        .get(base + '/' + campaign.info._id + '/send')
        .set('cookie', user.sid)
        .expect(204, done);
    });
  });

  describe('DELETE /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .del(base + '/' + campaign.info._id)
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      request
        .del(base + '/52e7ecb9e023120000c33697')
        .set('Cookie', user.sid)
        .expect(404, done);
    });

    it('204 if logged in', function(done) {
      request
        .del(base + '/' + campaign.info._id)
        .set('cookie', user.sid)
        .expect(204, done);
    });
  });
});
