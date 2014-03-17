/**
 * Dependencies
 */

var isLoggedIn = false;
var request = require('./supertest');
var User = require('../../lib/user/model');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  email: 'admin@website.com',
  password: 'passwordz',
  type: 'administrator'
};

/**
 * Expose `agent`
 */

var agent = module.exports.agent = request.agent();

/**
 * Expose `login`
 */

module.exports.login = function(done) {
  if (isLoggedIn) return done();

  User.create(info, function() {
    agent
      .post('/api/login')
      .send(info)
      .expect(200)
      .end(function(err, res) {
        if (err || !res.ok) {
          done(err || res.text);
        } else {
          isLoggedIn = true;
          done();
        }
      });
  });
};
