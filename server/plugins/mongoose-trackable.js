
/**
 * Expose `plugin`
 */

module.exports = function(schema, options) {
  schema.add({
    created: Date,
    modified: Date
  });

  schema.pre('save', function(next) {
    this.modified = new Date();
    if (this.isNew) this.created = new Date();
    next();
  });
};
