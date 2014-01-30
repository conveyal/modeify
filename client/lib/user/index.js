
/**
 * Dependencies
 */

var model = require('model');
var request = require('request');

/**
 * Expose `User`
 */

var User = module.exports = model('User')
  .attr('email')
  .attr('type')
  .attr('created')
  .attr('modified');

/**
 * Cache `instance`
 */

module.exports.instance = null;

/**
 * Login
 */

User.login = function(data, callback) {
  request.post('/login', data, function(err, res) {
    if (res.ok) {
      module.exports.instance = new User(res.body);
      callback(null, err);
    } else {
      callback(err);
    }
  });
};
