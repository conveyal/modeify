import mongoose from '../mongo'
import trackablePlugin from '../plugins/mongoose-trackable'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: String,
  email: String,
  main_url: String,
  logo_url: String,
  labels: Array,
  locations: Array,
  ridepools: Array,
  opts: mongoose.Schema.Types.Mixed,
  stats: mongoose.Schema.Types.Mixed
})

schema.plugin(trackablePlugin)

schema.statics.findOrCreate = function (data, callback) {
  this
    .findOne()
    .where('name', data.name)
    .exec(function (err, org) {
      if (err) {
        callback(err)
      } else if (org) {
        callback(null, org)
      } else {
        Organization.create(data, callback)
      }
    })
}

const Organization = mongoose.model('Organization', schema)

export default Organization
