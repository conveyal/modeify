/**
 * Dependencies
 */

var admin = require('./default-admin');
var request = require('./supertest');
var Org = require('../../lib/organization/model');

/**
 * Empty org
 */

var org = {
  name: 'Organization 123',
  address: '2300 Clarendon Blvd',
  city: 'Arlington',
  state: 'VA'
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
      admin.agent
        .get('/api/organizations')
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
      admin.agent
        .post('/api/organizations')
        .expect(400, done);
    });

    it('201 if logged in and correct data', function(done) {
      admin.agent
        .post('/api/organizations')
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
      admin.agent
        .post('/api/organizations')
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
      admin.agent
        .put('/api/organizations/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if logged in and correct data', function(done) {
      org.name += '2';
      admin.agent
        .put('/api/organizations/' + org._id)
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
      admin.agent
        .del('/api/organizations/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if correct id and logged in', function(done) {
      admin.agent
        .del('/api/organizations/' + org._id)
        .expect(204, done);
    });
  });
});
