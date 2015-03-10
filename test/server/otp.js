var request = require('./supertest');

/**
 * BDD
 */

describe.skip('/api/otp', function() {
  describe('GET /profile', function() {
    it('400 and return 0 options', function(done) {
      request
        .get('/api/otp/profile' +
          '?from=39.76618,-86.441052&to=39.76618,-86.441052')
        .expect(400, done);
    });

    it.skip('200 and return 12 options', function(done) {
      request
        .get(
          '/api/otp/profile?from=38.86583312290139%2C-77.06398626875051&to=38.90485941802882%2C-77.03453592419277'
        )
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.options.length.should.equal(12);
          done();
        });
    });
  });
});
