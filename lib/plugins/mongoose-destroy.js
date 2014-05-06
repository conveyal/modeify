/**
 * Don't actually destroy a model
 */

module.exports = function(schema) {
  schema.add({
    destroyed: {
      type: Boolean,
      default: false
    }
  });
};
