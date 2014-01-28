/**
 * Dependencies
 */

var Org = require('../../server/organization/model');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  name: 'Organization',
  address: '1600 Pennsylvania Ave, Washington, DC'
};

/**
 * Expose `login`
 */

module.exports.create = function(done) {
  if (module.exports.info._id) return done();

  Org.findOrCreate(info, function(err, org) {
    module.exports.info = org;
    done();
  });
};
