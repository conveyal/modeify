/**
 * Dependencies
 */

var Org = require('../../server/organization/model');

/**
 * Expose `info`
 */

var info = module.exports.info = {
  name: 'Organizationally',
  address: '1600 Pennsylvania Ave',
  city: 'Washington',
  state: 'DC',
  zip: 20005
};

/**
 * Expose `login`
 */

module.exports.create = function(done) {
  if (module.exports.info._id) return done();

  Org.findOrCreate(info, function(err, org) {
    if (err) {
      done(err);
    } else {
      module.exports.info = org;
      done(null, org);
    }
  });
};
