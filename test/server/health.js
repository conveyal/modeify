var request = require('./supertest');

describe('/api/health', function() {
  describe('GET /', function() {
    it('200 and return an object', function(done) {
      request
        .get('/api/health')
        .expect(200, done);
    });
  });
});
