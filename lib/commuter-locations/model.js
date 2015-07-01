import Commuter from '../commuter/model'
import later from '../later'
import mongoose from '../mongo'
import { profileCommuterLocations, matchCommuterLocations } from './profile'

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
  },
  profile: Object,
  profileOptions: Object,
  matches: [Schema.Types.ObjectId] // Commuter Ids
})

/**
 * Find commuters and profiles based on a location
 */

schema.statics.findCommutersAndProfiles = function (_location) {
  return new Promise((resolve, reject) => {
    let commuterToCL = {}
    this.find()
      .where('_location', _location)
      .exec()
      .then((cls) => {
        cls.forEach((cl) => {
          commuterToCL[cl._commuter] = cl
        })
        return Commuter
          .find({
            _id: {
              $in: cls.map(cl => cl._commuter)
            }
          })
          .populate('_user')
          .exec()
      }, reject)
      .then((commuters) => {
        resolve(commuters.map((c) => {
          const cl = commuterToCL[c._id]
          cl._commuter = c
          return cl
        }))
      }, reject)
  })
}

const CommuterLocation = mongoose.model('CommuterLocation', schema)

export default CommuterLocation

CommuterLocation.addCommuters = function (commuters) {
  return Promise.all(commuters.map((c) => {
    const name = (c._commuter.name || '').split(' ')
    return Commuter
      .generate({
        email: c._commuter.email
      }, {
        address: c._commuter.address,
        name: {
          first: name[0],
          last: name[1]
        }
      })
      .then((commuter) => {
        return CommuterLocation.create({
          _commuter: commuter._id,
          _location: c._location
        })
      })
  })).then((commuterLocations) => {
    populate(commuterLocations)
    return commuterLocations
  })
}

function populate (commuterLocations) {
  later(() => {
    Promise.all(commuterLocations.map(cl => {
      return cl
        .populate('_commuter')
        .populate('_location')
        .execPopulate()
    })).then((cls) => {
      return Promise.all([profileCommuterLocations(commuterLocations), matchCommuterLocations(commuterLocations)])
    })
  })
}
