/**
 * Dependencies
 */

var async = require('async');
var geocode = require('../../server/geocode');

/**
 * Valid addresses
 */

var valid = [{
  address: '1111 Army Navy Drive, Arlington, VA 22202',
  ll: [0, 0]
}, {
  address: '1600 Pennsylvania Avenue, Washington, DC',
  ll: [0, 0]
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
          geocode.encode(row.address, function(err, ll) {
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
