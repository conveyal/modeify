/**
 * Dependencies
 */

var cookie = require('./cookie');
var admin = require('./admin-user');
var request = require('./supertest');
var User = require('../../server/user/model');

/**
 * New user
 */

var newUser = {
  email: 'fakeemail@fakewebsite.com'
};

/**
 * BDD
 */

describe('/api/users', function() {
  before(admin.login);

  describe('GET /', function() {
    it('401 if not logged in as an administrator', function(done) {
      request
        .get('/api/users')
        .expect(401, done);
    });

    it('200 and a list of users if an administrator', function(done) {
      request
        .get('/api/users')
        .set('Cookie', admin.sid)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.length.should.be.greaterThan(0);
          done();
        });
    });
  });

  describe('POST /', function() {
    it('401 if not logged in as an administrator', function(
      done) {
      request
        .post('/api/users')
        .expect(401, done);
    });

    it('201 and create a new user', function(done) {
      request
        .post('/api/users')
        .send(newUser)
        .set('Cookie', admin.sid)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          newUser._id = res.body._id;
          done();
        });
    });

    it('409 if email already taken', function(done) {
      request
        .post('/api/users')
        .send(newUser)
        .set('Cookie', admin.sid)
        .expect(409, done);
    });
  });

  describe('POST /change-password-request', function() {
    it('204 send a change password request with new token', function(done) {
      request
        .post('/api/users/change-password-request')
        .send({
          email: admin.info.email
        })
        .expect(204)
        .end(function(err, res) {
          if (err) return done(err);
          User
            .findOne()
            .where('email', admin.info.email)
            .exec(function(err, user) {
              if (err) return done(err);
              admin.info.change_password_key = user.change_password_key;
              done();
            });
        });
    });
  });

  describe('POST /change-password', function() {
    it('404 for an invalid key', function(done) {
      request
        .post('/api/users/change-password')
        .expect(404, done);
    });

    it('204 and change the password for a correct key', function(done) {
      request
        .post('/api/users/change-password')
        .send({
          change_password_key: admin.info.change_password_key,
          password: admin.info.password
        })
        .expect(204, done);
    });
  });

  describe('GET /:id', function() {
    it('401 if not logged in as an administrator', function(done) {
      request
        .get('/api/users/52e7ecb9e023120000c33697')
        .expect(401, done);
    });
  });

  describe('PUT /:id', function() {
    it('401 if not logged in as an administrator', function(done) {
      request
        .put('/api/users/52e7ecb9e023120000c33697')
        .expect(401, done);
    });

    it('404 for a non-existent id', function(done) {
      request
        .put('/api/users/52e7ecb9e023120000c33697')
        .set('Cookie', admin.sid)
        .expect(404, done);
    });

    it('204 if logged in as an administrator', function(done) {
      request
        .put('/api/users/' + newUser._id)
        .set('Cookie', admin.sid)
        .send({
          email: 'fakeemail2@gmail.com',
          password: 'newpassword'
        })
        .expect(204, done);
    });
  });

  describe('DELETE /:id', function() {
    it('401 if not logged in as an administrator', function(done) {
      request
        .del('/api/users/' + newUser._id)
        .expect(401, done);
    });

    it('404 for a non-existent id', function(done) {
      request
        .del('/api/users/52e7ecb9e023120000c33697')
        .set('Cookie', admin.sid)
        .expect(404, done);
    });

    it('204 if logged in as an administrator', function(done) {
      request
        .del('/api/users/' + newUser._id)
        .set('Cookie', admin.sid)
        .expect(204, done);
    });
  });
});
