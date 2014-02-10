/**
 * Dependencies
 */

var fs = require('fs');
var request = require('./supertest');

/**
 * Index
 */

var index = fs.readFileSync(__dirname + '/../../client/manager.html', 'utf8');

/**
 * Mocha
 */

describe('/', function() {
  it('should get index.html', function(done) {
    request.get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        res.text.should.equal(index);
        done();
      });
  });
});
