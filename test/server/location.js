var base = '/api/locations';
var supertest = require('./supertest');

var loc = {
  address: '1111 Army Navy Drive, Arlington, VA 22202',
  name: 'Home',
  type: 'residence'
};

var agent = supertest.agent();

describe(base, function() {
  before(function(done) {
    agent
      .get('/api/login-anonymously')
      .expect(200, done);
  });

  describe('POST /', function() {
    it('201 successfuly create a location',
      function(done) {
        agent
          .post(base)
          .send(loc)
          .expect(201)
          .end(function(err, res) {
            if (err) return done(err);
            loc._id = res.body._id;
            done();
          });
      });

    it('200 successfully update a location',
      function(done) {
        loc.type = 'work';
        agent
          .put(base + '/' + loc._id)
          .send(loc)
          .expect(200, done);
      });
  });
});
