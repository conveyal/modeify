import {findMatches} from 'ridematcher'
import qs from 'querystring'

import otp from '../otp'

const PROFILE_OPTIONS = {
  accessModes: 'WALK,CAR_PARK', // BICYCLE,BICYCLE_RENT
  bikeSafe: 1000,
  bikeSpeed: 4.1,
  directModes: 'CAR,WALK', // ,BICYCLE,BICYCLE_RENT',
  egressModes: 'WALK', // ,BICYCLE_RENT',
  endTime: '9:00',
  startTime: '7:00',
  limit: 2,
  transitModes: 'BUS,TRAINISH',
  walkSpeed: 1.4
}

const MATCHING_OPTIONS = {
  radius: 1
}

/**
 * Profile a list of commuter locations.
 *
 * @param {Array} commuterLocations Array of commuter locations to be profiled.
 * @param {Object} options Options to pass to the OTP profiler.
 * @return {Promise}
 * @example
 * import {profileCommuterLocations} from './profile'
 * import CommuterLocations from './model'
 * CommuterLocations.find({}).exec().then((commuterLocations) => {
 *   return profileCommuterLocations(commuterLocations)
 * }).then((commuterLocations) => {
 *   // commuterLocations.profile
 * })
 */

export function profileCommuterLocations (commuterLocations = [], opts = {}) {
  return Promise.all(commuterLocations.map(cl => {
    return profile(cl._commuter.coordinate, cl._location.coordinate, opts).then(profile => mapCommuterLocationProfile(cl, profile))
  }))
}

/**
 * Profile a commuter location.
 *
 * @param {Object} fromCoord From coordinate.
 * @param {Object} toCoord To coordinate.
 * @param {Object} opts Options to be passed to the profiler.
 * @return {Promise}
 * @example
 */

export function profile (fcoord, tcoord, opts = {}) {
  const query = qs.stringify(Object.assign(opts, PROFILE_OPTIONS, {
    from: `${fcoord.lat},${fcoord.lng}`,
    to: `${tcoord.lat},${tcoord.lng}`
  }))

  return otp(`/profile?${query}`)
}

/**
 * Match commuters.
 *
 * @param {Array} commuterLocations Commuter location combinations to be matched.
 * @param {Object} opts Options to be passed to the ridematcher.
 * @return {Promise}
 */

export function matchCommuterLocations (commuterLocations = [], opts = {}) {
  return findMatches(mapToRideMatchingFormat(commuterLocations), Object.assign({}, MATCHING_OPTIONS, opts)).then((matches) => {
    return mapCommuterLocationMatches(commuterLocations, matches)
  })
}

function mapCommuterLocationProfile (cl, profile) {
  cl.profile = profile
  cl.markModified('profile')
  cl.profiled = new Date()
  return cl
}

function mapToRideMatchingFormat (cls) {
  return cls.map(cl => {
    const coord = cl._commuter.coordinate || {}
    return {
      _id: cl._commuter._id,
      from: [coord.lng, coord.lat]
    }
  })
}

function mapCommuterLocationMatches (commuterLocations, matches) {
  return commuterLocations.map(cl => {
    console.log(matches[cl._commuter._id])
    cl.matches = matches[cl._commuter._id] || []
    cl.markModified('matches')
    cl.matched = new Date()
    return cl
  })
}
