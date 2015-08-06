import {findMatches as commuterConnectionsMatches} from 'commuter-connections'
import {Router} from 'express'

import {commuterIsLoggedIn} from '../auth'
import CommuterLocations from '../commuter-locations/model'
import otp from '../otp'
import Ridepool from '../ridepool/model'

const app = Router()

export default app

app.get('/', commuterIsLoggedIn, function (req, res) {
  const [startLng, startLat] = parseFloatArray(req.query.from)
  const [endLng, endLat] = parseFloatArray(req.query.to)

  Promise.all([
    otp(req.url),
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
  .then(([profile, externalMatches, internalMatches, ridepoolMatches]) => {
    const data = {
      externalMatches,
      internalMatches,
      profile,
      ridepoolMatches
    }

    if (req.query.callback) { // JSONP requests
      res.type('text/javascript')
      res.status(200).send(data)
    } else {
      res.type('application/json')
      res.status(200).send(data)
    }
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
