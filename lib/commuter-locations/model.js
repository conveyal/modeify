import mongoose from '../mongo'

const Schema = mongoose.Schema

const schema = new Schema({
  _location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  _commuter: {
    type: Schema.Types.ObjectId,
    ref: 'Commuter',
    required: true
  }
})

schema.statics.getCommuters = function (locationId) {
  return this.find()
    .where('_location', locationId)
    .populate('_commuter')
    .exec()
}

schema.statics.getLocations = function (commuterId) {
  return this.find()
    .where('_commuter', commuterId)
    .populate('_location')
    .exec()
}

const CommuterLocation = mongoose.model('CommuterLocation', schema)

export default CommuterLocation
