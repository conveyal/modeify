const mongoosePaginate = require('mongoose-paginate')

const Commuter = require('../commuter/model')
const Location = require('../location/model')
const Email = require('../email/model')

const config = require('../config')
const later = require('../later')
const mongoose = require('../mongo')
const log = require('../log')
const {profileCommuterLocations, matchCommuterLocations} = require('./profile')
const {send} = require('../spark')

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
  return this._commuter.sendEmail('profile-and-matches', {
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

schema.statics.findCommutersAndProfiles = function (_location, offset, limit) {
  if (offset && limit) { // page-based retrieval
    const options = {
      offset: parseInt(offset),
      limit: parseInt(limit),
      populate: '_commuter _location'
    }
    return new Promise((resolve, reject) => {
      this.paginate({ _location: _location }, options)
        .then(result => result.docs)
        .then(resolve)
        .catch(reject)
    })
  } else { // fetch all records for location
    return new Promise((resolve, reject) => {
      this.find()
        .where('_location', _location)
        .populate('_commuter _location')
        .exec()
        .then(resolve)
        .catch(reject)
    })
  }
}

schema.statics.getCommuterCount = function (_location) {
  return new Promise((resolve, reject) => {
    this.count({ _location }, (err, count) => {
      if (err) reject(err)
      console.log('Comm count for ' + _location + ' is: ' + count)
      resolve(count)
    })
  })
}

/**
 * Find locations and profiles.
 */

schema.statics.findLocationsForCommuter = function (_commuter) {
  return new Promise((resolve, reject) => {
    this.find()
      .where('_commuter', _commuter)
      .populate('_commuter _location')
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
      .then(resolve, reject)
  })
}

schema.statics.addCommuters = function (stormpathApplication, commuters) {
  later(() => {
    const commutersPerBatch = 1
    const delay = 250
    log.info(`adding ${commuters.length} commuters`)

    const nextBatch = (startIndex) => {
      const thisBatchSize = Math.min(commutersPerBatch, commuters.length - startIndex)
      log.info(`new addCommuters batch at ${startIndex} w/ size ${thisBatchSize}`)
      Promise.all(commuters.slice(startIndex, startIndex + thisBatchSize).map((c) => {
        c._commuter._organization = c._organization
        return Commuter
          .generate(stormpathApplication, {
            email: c._commuter.email,
            givenName: c._commuter.givenName,
            surname: c._commuter.surname
          }, c._commuter)
          .then((commuter) => {
            return this.create({
              _commuter: commuter._id,
              _location: c._location
            })
          })
      })).then((c) => {
        startIndex += commutersPerBatch
        if (startIndex < commuters.length) {
          setTimeout(() => { nextBatch(startIndex) }, delay)
        }
      })
    }

    nextBatch(0)
  })
  return Promise.resolve('started')
}

schema.statics.profileAndMatch = function (commuterLocations, callback) {
  later(() => {
    log.info('start profiling and matching')

    matchCommuterLocations(commuterLocations)
      .then(() => {
        log.info('matching successful')
        return Promise.all(commuterLocations.map(cl => cl.save())).then(() => {
          return profileCommuterLocations(commuterLocations)
        })
      })
      .then(() => {
        log.info('profiling successful')
        return Promise.all(commuterLocations.map(cl => cl.save())).then(() => {
          callback()
        })
      })
  })
  return Promise.resolve('started')
}

schema.statics.profile = function (commuterLocations, callback) {
  later(() => {
    log.info('start profiling')

    profileCommuterLocations(commuterLocations)
      .then(() => {
        log.info('profiling successful')
        return Promise.all(commuterLocations.map(cl => cl.save())).then(() => {
          callback()
        })
      })
  })
  return Promise.resolve('started')
}

schema.statics.match = function (commuterLocations, radius, callback) {
  log.info('start matching')
  const opts = {}
  if (radius) opts.radius = radius
  matchCommuterLocations(commuterLocations, opts)
    .then(() => {
      log.info('matching successful')
      return Promise.all(commuterLocations.map(cl => cl.save())).then(() => {
        log.info('saved commuterLocations')
        callback()
      })
    })
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

schema.statics.notifyManagers = function (_location, stormpathClient) {
  // get the location
  Location.findById(_location, (err, location) => {
    if (err) {
      log.error('Could not find locations', err)
    }
    // get commuter-locations for this location
    this.findCommutersAndProfiles(_location).then((cls) => {
      // check if any matches have occured since last Update
      var newMatches = false
      cls.forEach((cl) => {
        if (!location.last_notified || location.last_notified < cl.matched) {
          newMatches = true
        }
      })
      if (newMatches && location.rideshare_manager) {
        stormpathClient.getAccount(`https://api.stormpath.com/v1/accounts/${location.rideshare_manager}`, (err, user) => {
          if (err) {
            log.error('Could not retrieve manager to notify', err)
          } else if (!user) {
            log.error('User does not exist.')
          } else {
            // send email
            const options = {
              applicationName: config.name,
              domain: config.domain,
              location: location.name,
              location_url: `${config.domain}/manager/organizations/${location.created_by}/locations/${location.id}`,
              subject: 'New Carpool Matches Found for ' + location.name,
              template: 'notify-manager-matches',
              to: {
                email: user.email
              }
            }
            send(options, (err, result) => {
              if (err) {
                log.error(err)
              } else {
                location.last_notified = new Date()
                location.save(function (err, loc) {
                  if (err) {
                    log.error('error saving location', err)
                  }
                })

                Email.create({
                  _user: user._id,
                  metadata: options,
                  result: result
                })
              }
            })
          }
        })
      }
    })
  })
}

schema.plugin(mongoosePaginate)

const CommuterLocation = mongoose.model('CommuterLocation', schema)

module.exports = CommuterLocation
