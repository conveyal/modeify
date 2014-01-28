/**
 * Dependencies
 */

var cookie = require('./cookie');
var request = require('./supertest');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  email: 'tgerhardt@conveyal.com',
  password: 'encrypted'
};

/**
 * Expose `login`
 */

module.exports.login = function(done) {
  request
    .post('/api/login')
    .send(info)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);
      info.sid = cookie(res);
      done();
    });
};
