var mongoose = require('../mongo')

import log from '../log'

/**
 * Schema
 */

var schema = new mongoose.Schema({
  category: {
    default: 'other',
    type: String
  },
  created_by: mongoose.Schema.Types.ObjectId,
  name: String,
  original_address: String,
  rideshare_manager: String,
  last_notified: Date
})

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-geocode'))
schema.plugin(require('../plugins/mongoose-trackable'))

/**
 * Expose `Location`
 */

var Location = module.exports = mongoose.model('Location', schema)

/**
 * Find or create
 */

Location.findOrCreate = function (data, callback) {
  log.info('Location.findOrCreate ' + data.name + ': ' + data.coordinate.lng + ', ' + data.coordinate.lat)
  Location
    .findOne()
    .where('coordinate.lng', data.coordinate.lng)
    .where('coordinate.lat', data.coordinate.lat)
    .where('created_by', data.created_by)
    .exec(function (err, loc) {
      if (err) {
        callback(err)
      } else if (loc) {
        callback(null, loc)
      } else {
        Location.create(data, callback)
      }
    })
}
