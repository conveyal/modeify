/**
 * Dependencies
 */

var admin = require('./default-user');
var request = require('./supertest');

/**
 * Agent to use
 */

var agent = request.agent();

/**
 * Mocha
 */

describe.only('/api', function() {
  before(admin.login);

  describe('POST /login', function() {
    it('should return 404 with no email or password', function(done) {
      request.post('/api/login')
        .expect(404, done);
    });

    it('should return 404 with a non-existing email', function(done) {
      request
        .post('/api/login')
        .send({
          email: 'fakeemailz@gmail.com'
        })
        .expect(404, done);
    });

    it('should return 400 for an existing email but incorrect password',
      function(done) {
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
    it('should return 401 with no cookie passed', function(done) {
      request
        .get('/api/is-logged-in')
        .expect(401, done);
    });

    it('should return 200 wth a cookie passed', function(done) {
      agent
        .get('/api/is-logged-in')
        .expect(200, done);
    });
  });
});
