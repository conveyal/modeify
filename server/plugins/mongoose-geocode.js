/**
 * Dependencies
 */

var geocode = require('../geocode');

/**
 * Expose `plugin`
 */

module.exports = function(schema, options) {

  /**
   * Add address and coordinate fields
   */

  schema.add({
    address: String,
    coordinate: {
      type: Array,
      default: [0, 0]
    }
  });

  /**
   * Geocode address on change
   */

  schema.pre('save', true, function(next, done) {
    next();
    var self = this;
    if (this.isModified('address')) {
      geocode.encode(this.address, function(err, coords) {
        if (err) {
          done(err);
        } else {
          self.coordinate = coords;
          done();
        }
      });
    } else {
      done();
    }
  });

  /**
   * Add geospatial index to coordinate
   */

  schema.index({
    coordinate: '2d'
  });
};
