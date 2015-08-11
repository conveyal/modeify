import {findMatches as commuterConnectionsMatches} from 'commuter-connections'
import {Router} from 'express'

import {commuterIsLoggedIn} from '../auth'
import CommuterLocations from '../commuter-locations/model'
import * as otp from '../otp'
import Ridepool from '../ridepool/model'

const app = Router()

export default app

app.get('/', commuterIsLoggedIn, function (req, res) {
  const [startLat, startLng] = parseFloatArray(req.query.from)
  const [endLat, endLng] = parseFloatArray(req.query.to)
  const qs = req.url.split('?')[1]

  let data = {}
  Promise.all([
    otp.profile(qs),
    otp.routes(),
    commuterConnectionsMatches({
      startLat: startLat,
      startLng: startLng,
      endLat: endLat,
      endLng: endLng,
      startRadius: req.query.fromRadius || 1,
      endRadius: req.query.toRadius || 0.5
    }),
    CommuterLocations.findLocationsForCommuter(req.session.commuter._id),
    Ridepool.findMatches([ startLng, startLat ], [ endLng, endLat ])
  ])
  .then(([profile, routes, externalMatches, internalMatches, ridepoolMatches]) => {
    data = {
      externalMatches,
      internalMatches,
      profile: profile.options,
      ridepoolMatches,
      routes
    }

    return otp.patternsFromProfile(data.profile)
  })
  .then(patterns => {
    data.patterns = patterns

    // Populate the transit segments in the profile
    otp.populateTransitSegments(data.profile, data.patterns, data.routes)

    // Populate the stop times
    return otp.populateStopTimes(data.profile, req.query.date, parseInt(req.query.startTime, 10), parseInt(req.query.endTime, 10))
  })
  .then(() => {
    res.status(200).send(data)
  })
  .catch((err) => {
    res.status(400).send(err)
  })
})

function parseFloatArray (str) {
  let array = []
  if (str && str.length > 0) {
    array = str.split(',').map(parseFloat)
  }
  return array
}
