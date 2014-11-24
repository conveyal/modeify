/**
 * Dependencies
 */

var config = require('../../lib/config');
var fs = require('fs');
var hogan = require('hogan.js');
var request = require('./supertest');

/**
 * Manager
 */

var manager = hogan.compile(fs.readFileSync(__dirname +
  '/../../client/manager.html', 'utf8')).render({
  application: config.application,
  segmentio_key: config.segmentio_key,
  static_url: config.static_url,
  version: config.version
});

/**
 * Planner
 */

var planner = hogan.compile(fs.readFileSync(__dirname +
  '/../../client/planner.html', 'utf8')).render({
  application: config.application,
  segmentio_key: config.segmentio_key,
  static_url: config.static_url,
  version: config.version
});

/**
 * Mocha
 */

describe('HTML', function() {
  describe('/manager', function() {
    it('should get manager.html', function(done) {
      request.get('/manager')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.text.should.equal(manager);
          done();
        });
    });
  });

  describe('/', function() {
    it('should get planner.html', function(done) {
      request.get('/')
        .expect('content-type', 'text/html; charset=utf-8')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.text.should.equal(planner);
          done();
        });
    });
  });
});
