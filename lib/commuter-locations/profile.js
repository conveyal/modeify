import matcher from 'ridematcher'
import qs from 'querystring'

import otp from '../otp'

function match (commuters, opts = {}) {
  matcher(commuters.map(c => {
    return {
      commuter: c,

    }
  }), opts)
}

function profile (commuter, location, opts = {}) {
  const query = Object.assign(opts, qs.stringify({
    from: commuter.coordinate(),
    to: location.coordinate()
  }))
  return otp(`/profile?${query}`)
}
