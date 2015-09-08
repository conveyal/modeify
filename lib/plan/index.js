import {findMatches as commuterConnectionsMatches} from 'commuter-connections'
import {Router} from 'express'

import CommuterLocations from '../commuter-locations/model'
import * as otp from '../otp'
import Ridepool from '../ridepool/model'

const app = Router()

export default app

app.get('/', function (req, res) {
  const [startLat, startLng] = parseFloatArray(req.query.from)
  const [endLat, endLng] = parseFloatArray(req.query.to)
  const qs = req.url.split('?')[1]

  const plans = [
    otp.profile(qs),
    otp.routes(),
    /*commuterConnectionsMatches({
      startLat: startLat,
      startLng: startLng,
      endLat: endLat,
      endLng: endLng,
      startRadius: req.query.fromRadius || 1,
      endRadius: req.query.toRadius || 0.5
    }),*/
    Ridepool.findMatches([ startLng, startLat ], [ endLng, endLat ])
  ]

  if (req.user) {
    plans.push(CommuterLocations.findLocationsForCommuter(req.user.id))
  }

  let data = {}
  Promise.all(plans)
  //.then(([profile, routes, externalMatches, ridepoolMatches, internalMatches]) => {
  .then(([profile, routes, ridepoolMatches, internalMatches]) => {
    data = {
      externalMatches: 0,
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
  if (str && str.length > 0) {
    return str.split(',').map(parseFloat)
  }
  return []
}
