var Batch = require('batch')
var Location = require('../location/model')
var mongoose = require('../mongo')
var Schema = mongoose.Schema

/**
 * Schema
 */

var schema = new Schema({
  created_by: Schema.Types.ObjectId,
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }],
  opts: Schema.Types.Mixed
})

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'))
schema.plugin(require('../plugins/mongoose-trash'))

/**
 * Generate a journey
 */

schema.statics.generate = function (data, callback) {
  if (!data.locations || !data.locations.length || data.locations.length < 2) {
    return callback(new Error('Journey requires 2 or more locations.'))
  }

  var batch = new Batch()
  var self = this

  data.locations.forEach(function (location) {
    batch.push(function (done) {
      if (location._id) {
        Location.findById(location._id, done)
      } else {
        Location.create({
          address: location.address,
          category: location.category,
          created_by: data.created_by,
          name: location.name
        }, done)
      }
    })
  })

  batch.end(function (err, locations) {
    if (err) {
      callback(err)
    } else {
      data.locations = locations
      self.create(data, function (err, journey) {
        if (err) {
          callback(err)
        } else {
          // Pass back populated locations
          self
            .findById(journey._id)
            .populate('locations')
            .exec(callback)
        }
      })
    }
  })
}

/**
 * Expose `Journey`
 */

module.exports = mongoose.model('Journey', schema)
