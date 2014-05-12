/**
 * Expose `plugin`
 */

module.exports = function(schema, options) {
  schema.add({
    created: {
      type: Date,
      default: Date.now
    },
    modified: Date
  });

  schema.pre('save', function(next) {
    this.modified = new Date();
    next();
  });
};
