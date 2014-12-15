var mongoose = require('../mongo');

/**
 * Schema
 */

var schema = new mongoose.Schema({
  tags: Array,
  title: String,
  description: String
});

/**
 * Match tags
 */

schema.methods.tagsContainsSubsetOf = function(tags) {
  for (var set in this.tags)
    if (isSubsetOf(set, tags)) return true;
  return false;
};

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `RouteResource`
 */

var RouteResource = module.exports = mongoose.model('RouteResource', schema);

/**
 * Find by tags
 */

RouteResource.findByTags = function(tags, callback) {
  if (!Array.isArray(tags)) tags = tags.split(',');
  RouteResource
    .find()
    .exec(function(err, resources) {
      if (err) {
        callback(err);
      } else if (!resources) {
        callback(null, []);
      } else {
        callback(null, resources.filter(function(resource) {
          return resource.tagsContainsSubsetOf(tags);
        }));
      }
    });
};

/**
 * Test of one array is the subset of the other
 */

function isSubsetOf(a1, a2) {
  if (a1.length > a2.length) return false;

  for (var i = 0; i < a1.length; i++)
    if (a2.indexOf(a1[i]) === -1) return false;
  return true;
}
