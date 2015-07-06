import {findMatches} from 'ridematcher'
import qs from 'querystring'

import otp from '../otp'

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
  const query = qs.stringify(Object.assign(opts, {
    from: [ccoord.lng, ccoord.lat],
    to: [lcoord.lng, lcoord.lat]
  }))

  return otp(`/profile?${query}`)
}
