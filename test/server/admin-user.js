/**
 * Dependencies
 */

var cookie = require('./cookie');
var request = require('./supertest');
var User = require('../../server/user/model');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  email: 'admin@website.com',
  password: 'passwordz',
  type: 'administrator'
};

/**
 * Expose `login`
 */

module.exports.login = function(done) {
  if (module.exports.sid) return done();

  User.create(info, function() {
    request
      .post('/api/login')
      .send(info)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        module.exports.sid = cookie(res);
        done();
      });
  });
};
