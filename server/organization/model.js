/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: String,
  email: String,
  labels: Array,
  opts: mongoose.Schema.Types.Mixed,
  stats: mongoose.Schema.Types.Mixed
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-geocode'));
schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Organization`
 */

var Organization = module.exports = mongoose.model('Organization', schema);

/**
 * Find or create
 */

Organization.findOrCreate = function(data, callback) {
  Organization
    .findOne()
    .where('name', data.name)
    .exec(function(err, org) {
      if (err) {
        callback(err);
      } else if (org) {
        callback(null, org);
      } else {
        Organization.create(data, callback);
      }
    });
};
