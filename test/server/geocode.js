/**
 * Dependencies
 */

var async = require('async');
var geocode = require('../../server/geocode');
var request = require('./supertest');

/**
 * Valid addresses
 */

var valid = [{
  address: '1111 Army Navy Drive',
  city: 'Arlington',
  state: 'VA',
  zip: 22202,
  ll: {
    lng: -77.06398626875051,
    lat: 38.86583312290139
  }
}, {
  address: '1600 Pennsylvania Avenue',
  cit: 'Washington',
  state: 'DC',
  zip: 20005,
  ll: {
    lng: -77.03556897003114,
    lat: 38.898732984440755
  }
}];

/**
 * Invalid addresses
 */

/**
 * BDD
 */

describe('gecoder', function() {
  describe('#encode()', function() {
    it('should correctly convert the valid addresses into ll points',
      function(done) {
        async.each(valid, function(row, next) {
          geocode.encode(row, function(err, ll) {
            if (err) return next(err);
            ll.should.eql(row.ll);
            next();
          });
        }, done);
      });
  });

  describe('#reverse()', function() {
    it.skip('should correctly convert the valid ll points into addresses',
      function(done) {
        async.each(valid, function(row, next) {
          geocode.reverse(row.ll, function(err, address) {
            if (err) return next(err);
            address.should.eql(row.address);
            next();
          });
        }, done);
      });
  });
});
