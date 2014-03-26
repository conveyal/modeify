var request = require('./supertest');

/**
 * BDD
 */

describe('/api/otp', function() {
  describe('GET /profile', function() {
    it('200 and return 0 options', function(done) {
      request
        .get('/api/otp/profile' +
          '?from=39.76618,-86.441052&to=39.76618,-86.441052')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.options.length.should.equal(0);
          done();
        });
    });

    it('200 and return 3 options', function(done) {
      request
        .get(
          '/api/otp/profile?from=38.91702804211155%2C-77.0304508958913&to=38.90485941802882%2C-77.03453592419277&startTime=20%3A30&endTime=22%3A30&date=2014-03-26&orderBy=MIN&limit=3'
      )
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.options.length.should.equal(3);
          done();
        });
    });
  });
});
