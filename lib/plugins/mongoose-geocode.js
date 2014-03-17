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
    city: String,
    state: String,
    neighborhood: String,
    zip: Number,
    coordinate: {
      type: Object,
      default: {
        lng: 0,
        lat: 0
      }
    }
  });

  /**
   * Geocode address on change
   */

  schema.pre('save', true, function(next, done) {
    next();
    var self = this;
    if (this.isModified('address') || this.isModified('city') || this.isModified(
      'state') || this.isModified('zip')) {
      geocode.encode(this.toJSON(), function(err, coords) {
        if (err) {
          // TODO: Handle this
          done();
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

  /**
   * Full address
   */

  schema.methods.fullAddress = function() {
    return [this.address, this.city, this.state, this.zip].filter(function(v) {
      return !!v;
    }).join(', ');
  };
};
