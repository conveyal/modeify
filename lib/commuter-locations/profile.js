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

export function profileCommuterLocations (commuterLocations = [], opts = {}) {
  return Promise.all(commuterLocations.map(cl => {
    return profile(cl, opts)
      .then((profile) => {
        cl.profile = profile
        cl.markModified('profile')
        cl.profiled = new Date()
        return commuterLocations
      })
  }))
}

export function matchCommuterLocations (commuterLocations = [], opts = {}) {
  return findMatches(commuterLocations.map(cl => {
    const coord = cl._commuter.coordinate || {}
    return {
      _id: cl._commuter._id,
      from: [coord.lng, coord.lat]
    }
  }), opts)
    .then((matches) => {
      console.log(matches)
      commuterLocations.forEach(cl => {
        const newMatches = matches[cl._id]
        if (newMatches && newMatches.length > 0) {
          let currentMatches = cl.matches || []
          if (currentMatches.length > 0) {
            newMatches.forEach((nm) => {
              if (currentMatches.find(cm => nm._id === cm._id) === undefined) {
                currentMatches.push(nm)
              }
            })
          } else {
            currentMatches = newMatches
          }
          cl.matches = currentMatches
          cl.markModified('matches')
          cl.matched = new Date()
        }
      })
      return commuterLocations
    })
}

export function profile (commuterLocation, opts = {}) {
  const ccoord = commuterLocation._commuter.coordinate || {}
  const lcoord = commuterLocation._location.coordinate || {}
  const query = qs.stringify(Object.assign(opts, PROFILE_OPTIONS, {
    from: `${ccoord.lat},${ccoord.lng}`,
    to: `${lcoord.lat},${lcoord.lng}`
  }))

  return otp(`/profile?${query}`)
}
