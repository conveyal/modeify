import Commuter from '../commuter/model'
import config from '../config'
import later from '../later'
import mongoose from '../mongo'
import log from '../log'
import { profileCommuterLocations, matchCommuterLocations } from './profile'

const Schema = mongoose.Schema

const Status = {
  SENT: 'sent'
}

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
  profile: Schema.Types.Mixed,
  profiled: Date,
  profileOptions: Schema.Types.Mixed,
  matches: [Schema.Types.Mixed],
  matched: Date,
  status: String
})

/**
 * Send profile and matches
 */

schema.methods.sendProfileAndMatches = function () {
  return this._commuter
    .sendEmail('profile-and-matches', {
      matches: (this.matches || []).length,
      profile: this.profile,
      link: `${config.base_url}/planner/${this._commuter.link}?from=${this._commuter.fullAddress()}&to=${this._location.fullAddress()}`,
      subject: 'CarFreeAtoZ Commute Profile and Carpool Matches'
    })
    .then((email) => {
      this.status = Status.SENT
      return this
    })
}

/**
 * Find commuters and profiles based on a location
 */

schema.statics.findCommutersAndProfiles = function (_location) {
  return new Promise((resolve, reject) => {
    this.find()
      .where('_location', _location)
      .where('_commuter').ne(null)
      .populate('_commuter _location')
      .exec()
      .then((cls) => {
        Promise.all(cls.map(cl => {
          return cl._commuter
            .populate('_user')
            .execPopulate()
        })).then(() => {
          resolve(cls)
        }, reject)
      }, reject)
  })
}

/**
 * Find locations and profiles.
 */

schema.statics.findLocationsForCommuter = function (_commuter) {
  return new Promise((resolve, reject) => {
    this.find()
      .where('_commuter', _commuter)
      .populate('_location')
      .populate('_commuter')
      .exec()
      .then(populateAllMatches)
      .then(resolve)
      .catch(reject)
  })
}

function populateAllMatches (cls) {
  return Promise.all(cls.map(cl => {
    return new Promise((resolve, reject) => {
      populateMatches(cl.matches)
        .then((matches) => {
          cl.matches = matches
          resolve(cl)
        })
        .catch(reject)
    })
  }))
}

function populateMatches (matches) {
  return Promise.all(matches.map((match) => {
    return new Promise((resolve, reject) => {
      Commuter
        .findById(match._id || match)
        .exec()
        .then((commuter) => {
          match.commuter = commuter
          resolve(match)
        })
        .catch(reject)
    })
  }))
}

/**
 * Find by id and populate
 */

schema.statics.findByIdAndPopulate = function (_id) {
  return new Promise((resolve, reject) => {
    this.findById(_id)
      .populate('_commuter _location')
      .exec()
      .then((cl) => {
        cl._commuter
          .populate('_user')
          .execPopulate()
          .then(() => {
            resolve(cl)
          }, reject)
      }, reject)
  })
}

schema.statics.addCommuters = function (commuters) {
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
        return this.create({
          _commuter: commuter._id,
          _location: c._location
        })
      })
  }))
}

schema.statics.profileAndMatch = function (commuterLocations) {
  later(() => {
    log.info('start profiling and matching')
    Promise.all([profileCommuterLocations(commuterLocations), matchCommuterLocations(commuterLocations)])
      .then(() => {
        log.info('profiling and matching successful')
        return Promise.all(commuterLocations.map(cl => cl.save()))
      })
      .catch((err) => {
        log.error('profiling and matching failed', err)
      })
  })
  return Promise.resolve('started')
}

schema.statics.sendProfilesAndMatches = function (commuterLocations) {
  // TODO: Filter commuter locations by status

  later(() => {
    log.info('start sending profiles and matches')
    Promise
      .all(commuterLocations.map(cl => cl.sendProfileAndMatches()))
      .then(() => {
        log.info('profiles sent successfully')
        return Promise.all(commuterLocations.map(cl => cl.save()))
      })
      .catch((err) => {
        log.error('profile sending failed', err)
      })
  })
}

const CommuterLocation = mongoose.model('CommuterLocation', schema)

export default CommuterLocation
