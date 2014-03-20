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
    neighborhood: String,
    city: String,
    county: String,
    state: String,
    zip: Number,
    country: String,
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
    if (this.addressChanged()) {
      geocode.encode(this.fullAddress(), function(err, addresses) {
        if (err) {
          // TODO: Handle this
          done();
        } else {
          var ll = addresses[0].feature.geometry;
          self.coordinate = {
            lng: ll.x,
            lat: ll.y
          };

          done();
        }
      });
    } else if (this.isModified('coordinate')) {
      geocode.reverse(this.coordinate, function(err, address) {
        if (err) {
          // TODO: Handle this
          done();
        } else {
          for (var key in address) {
            self[key] = address[key];
          }

          done();
        }
      });
    } else {
      done();
    }
  });

  /**
   * Address changed
   */

  schema.methods.addressChanged = function() {
    return this.isModified('address') || this.isModified('city') || this.isModified(
      'state') || this.isModified('zip');
  };

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
