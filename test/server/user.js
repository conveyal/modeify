/**
 * Dependencies
 */

var admin = require('./default-admin');
var request = require('./supertest');
var User = require('../../lib/user/model');

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

    it('200 a list of users if an administrator', function(done) {
      admin.agent
        .get('/api/users')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.length.should.be.greaterThan(0);
          done();
        });
    });

    it('200 list only managers', function(done) {
      admin.agent
        .get('/api/users')
        .query({
          type: 'manager'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.length.should.equal(0);
          done();
        });
    });

    it('200 list only administrators', function(done) {
      admin.agent
        .get('/api/users')
        .query({
          type: 'administrator'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.length.should.equal(1);
          done();
        });
    });

    it('200 handle advance queries', function(done) {
      admin.agent
        .get('/api/users')
        .query({
          $query: 'type:administrator OR type:manager'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.length.should.equal(1);
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
      admin.agent
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          newUser._id = res.body._id;
          done();
        });
    });

    it('409 if email already taken', function(done) {
      admin.agent
        .post('/api/users')
        .send(newUser)
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
    it('400 for an invalid key', function(done) {
      request
        .post('/api/users/change-password')
        .expect(400, done);
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

  describe('GET /confirm-email/:key', function() {
    it('400 for an invalid key', function(done) {
      request
        .get('/api/users/confirm-email/asdfasdf')
        .expect(400, done);
    });

    it('204 and set email_confirmed to true', function(done) {
      admin.info.email = 'admin2@website.com';
      admin.info.save(function(err) {
        if (err) return done(err);
        request
          .get('/api/users/confirm-email/' + admin.info.email_confirmation_key)
          .expect(204)
          .end(function(err, res) {
            if (err) return done(err);
            User
              .findOne()
              .where('email', admin.info.email)
              .exec(function(err, user) {
                if (err) return done(err);
                user.email_confirmed.should.equal(true);
                done();
              });
          });
      });
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
      admin.agent
        .put('/api/users/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if logged in as an administrator', function(done) {
      admin.agent
        .put('/api/users/' + newUser._id)
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
      admin.agent
        .del('/api/users/52e7ecb9e023120000c33697')
        .expect(404, done);
    });

    it('204 if logged in as an administrator', function(done) {
      admin.agent
        .del('/api/users/' + newUser._id)
        .expect(204, done);
    });

    it('204 and delete self', function(done) {
      admin.agent
        .del('/api/users/' + admin.info._id)
        .expect(204, done);
    });
  });
});
