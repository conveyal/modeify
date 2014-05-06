var base = '/api/journeys';
var supertest = require('./supertest');
var user = require('./default-admin');

/**
 * OD
 */

var od = {
  locations: [{
    address: '1111 Army Navy Drive, Arlington, VA 22202',
    name: 'Home',
    type: 'residence'
  }, {
    address: '1133 15th St NW, Washington, DC 20005',
    name: 'Work',
    type: 'office'
  }]
};

/**
 * Location 2
 */

var locations = null;

/**
 * BDD
 */

describe(base, function() {
  before(user.login);

  describe('POST /', function() {
    it('400 fail to create a journey without 2 locations', function(done) {
      user.agent
        .post(base)
        .send({
          locations: []
        })
        .expect(400, done);
    });

    it('200 successfuly create a journey with just addresses for locations',
      function(done) {
        user.agent
          .post(base)
          .send(od)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            od.locations[0].address.should.equal(res.body.locations[0].original_address);
            od.locations[1].address.should.equal(res.body.locations[1].original_address);

            locations = res.body.locations;
            done();
          });
      });

    it('200 successfully create a journey with pre-created locations',
      function(done) {
        user.agent
          .post(base)
          .send({
            locations: [locations[1], locations[0]]
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            od.locations[1].address.should.equal(res.body.locations[0].original_address);
            od.locations[0].address.should.equal(res.body.locations[1].original_address);

            done();
          });
      });
  });
});
