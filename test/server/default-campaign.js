/**
 * Dependencies
 */

var Org = require('./default-organization');
var Campaign = require('../../lib/campaign/model');

/**
 * Expose `info`
 */

module.exports.info = {};

/**
 * Create
 */

module.exports.create = function(done) {
  if (module.exports.info._id) return done();

  Org.create(function(err) {
    if (err) return done(err);
    module.exports.info._organization = Org.info._id;
    Campaign.create(module.exports.info, function(err, campaign) {
      if (err) return done(err);
      module.exports.info = campaign;
      done();
    });
  });
};
