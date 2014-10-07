var Commuter = require('../../lib/commuter/model');
var Org = require('./default-organization');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  _user: {
    email: 'jay@johnson.com',
    password: 'password'
  },
  name: 'Jay Johnson',
  address: '1800 Clarendon Blvd, Arlington, VA'
};

/**
 * Expose `create`
 */

module.exports.create = function(done) {
  if (module.exports.info._id) return done();

  Org.create(function(err, org) {
    Commuter.generate(info._user, {
      name: info.name,
      _organization: org._id
    }, function(err, commuter) {
      if (err) {
        done(err);
      } else {
        module.exports.info = commuter;
        done(null, commuter);
      }
    });
  });
};
