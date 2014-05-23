var admin = require('./default-admin');
var request = require('./supertest');

/**
 * Agent to use
 */

var agent = request.agent();

/**
 * Mocha
 */

describe('/api/auth', function() {
  before(admin.login);

  describe('POST /login', function() {
    it('404 with no email or password', function(done) {
      request.post('/api/login')
        .expect(404, done);
    });

    it('404 with a non-existing email', function(done) {
      request
        .post('/api/login')
        .send({
          email: 'fakeemailz@gmail.com'
        })
        .expect(404, done);
    });

    it('400 for an existing email but incorrect password', function(done) {
      request
        .post('/api/login')
        .send({
          email: admin.info.email,
          password: 'password'
        })
        .expect(400, done);
    });

    it('should return 200 for a correct email and password', function(done) {
      agent
        .post('/api/login')
        .send(admin.info)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /is-logged-in', function() {
    it('401 with no cookie passed', function(done) {
      request
        .get('/api/is-logged-in')
        .expect(401, done);
    });

    it('s200 wth a cookie passed', function(done) {
      agent
        .get('/api/is-logged-in')
        .expect(200, done);
    });
  });

  describe('GET /logout', function() {
    it('204', function(done) {
      agent
        .get('/api/logout')
        .expect(204, done);
    });

    it('401 after logout', function(done) {
      agent
        .get('/api/is-logged-in')
        .expect(401, done);
    });
  });

  describe('GET /login-anonymously', function() {
    it('200 create a user and log you in', function(done) {
      agent
        .get('/api/login-anonymously')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.anonymous.should.equal(true);
          done();
        });
    });

    it('200 from is-logged-in', function(done) {
      agent
        .get('/api/is-logged-in')
        .expect(200, done);
    });
  });
});
