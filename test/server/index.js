/**
 * Dependencies
 */

var fs = require('fs');
var hogan = require('hogan.js');
var request = require('./supertest');

/**
 * Index
 */

var index = hogan.compile(fs.readFileSync(__dirname + '/../../client/manager.html', 'utf8')).render({
  css: '/build/manager-app/build.css',
  js: '/build/manager-app/build.js',
  name: process.env.NAME
});

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
