/**
 * Dependencies
 */

var admin = require('./default-user');
var request = require('./supertest');
var Org = require('../../server/organization/model');

/**
 * Empty org
 */

var org = {
  name: 'Organization 123',
  address: '2100 Clarendon Boulevard, Arlington, VA'
};

/**
 * BDD
 */

describe('/api/organizations', function() {
  before(admin.login);

  describe('GET /', function() {
    it('401 if not logged in', function(done) {
      request
        .get('/api/organizations')
        .expect(401, done);
    });

    it('200 return a list of organizations', function(done) {
      request
        .get('/api/organizations')
        .set('Cookie', admin.sid)
        .expect(200, done);
    });
  });

  describe('POST /', function() {
    it('401 if not logged in', function(done) {
      request
        .post('/api/organizations')
        .expect(401, done);
    });

    it('400 if no name or no address', function(done) {
      request
        .post('/api/organizations')
        .set('Cookie', admin.sid)
        .expect(400, done);
    });

    it('201 if logged in and correct data', function(done) {
      request
        .post('/api/organizations')
        .set('Cookie', admin.sid)
        .send(org)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.address.should.equal(org.address);
          res.body.name.should.equal(org.name);
          org = res.body;
          done();
        });
    });

    it('409 if name already exists', function(done) {
      request
        .post('/api/organizations')
        .set('Cookie', admin.sid)
        .send(org)
        .expect(409, done);
    });
  });

  describe('PUT /:id', function() {
    it('401 if not logged in', function(done) {
      request
        .put('/api/organizations/52e7ecb9e023120000c33697')
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      request
        .put('/api/organizations/52e7ecb9e023120000c33697')
        .set('Cookie', admin.sid)
        .expect(404, done);
    });

    it('204 if logged in and correct data', function(done) {
      org.name += '2';
      request
        .put('/api/organizations/' + org._id)
        .set('Cookie', admin.sid)
        .send(org)
        .expect(204, done);
    });
  });

  describe('DELETE /', function() {
    it('401 if not logged in', function(done) {
      request
        .del('/api/organizations/52e7ecb9e023120000c33697')
        .expect(401, done);
    });

    it('404 if id does not exist', function(done) {
      request
        .del('/api/organizations/52e7ecb9e023120000c33697')
        .set('Cookie', admin.sid)
        .expect(404, done);
    });

    it('204 if correct id and logged in', function(done) {
      request
        .del('/api/organizations/' + org._id)
        .set('Cookie', admin.sid)
        .expect(204, done);
    });
  });
});
