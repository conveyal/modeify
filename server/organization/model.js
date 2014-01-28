/**
 * Dependencies
 */

var geocode = require('../geocode');
var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  coordinate: {
    type: Array,
    default: [0, 0]
  },
  tags: Array,
  opts: mongoose.Schema.Types.Mixed
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
 * Geospatial index
 */

schema.index({
  coordinate: '2d'
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Organization`
 */

var Organization = module.exports = mongoose.model('Organization', schema);
