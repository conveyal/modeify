import {findMatches as commuterConnectionsMatches} from 'commuter-connections'

import express from 'express'

import Ridepool from '../ridepool/model'
import {findRidepoolMatches} from 'ridematcher'

import log from '../log'

const router = express.Router()

export default router

router.get('/external-matches', function (req, res) {
  const [startLng, startLat] = parseFloatArray(req.query.from)
  const [endLng, endLat] = parseFloatArray(req.query.to)

  commuterConnectionsMatches({
    startLat: startLat,
    startLng: startLng,
    endLat: endLat,
    endLng: endLng,
    startRadius: req.query.fromRadius || 1,
    endRadius: req.query.toRadius || 0.5
  }).then((matches) => {
    res.status(200).json(matches)
  }, (err) => {
    res.status(400).send(err)
  })
})

router.get('/internal-matches', function (req, res) {
  const [startLng, startLat] = parseFloatArray(req.query.from)
  const [endLng, endLat] = parseFloatArray(req.query.to)

  Ridepool
    .find()
    .exec()
    .then((ridepools) => {
      let validRidepools = []
      ridepools.forEach(function(ridepool) {
        if(isNumeric(ridepool.from_lat) && isNumeric(ridepool.from_lng) && isNumeric(ridepool.to_lat) && isNumeric(ridepool.to_lng)) {
          validRidepools.push({
            _id: ridepool._id,
            name: ridepool.name,
            from: [ridepool.from_lng, ridepool.from_lat],
            to: [ridepool.to_lng, ridepool.to_lat]
          })
        }
      })

      findRidepoolMatches([startLng, startLat], [endLng, endLat], validRidepools).then((matches) => {
        res.status(200).json(matches)
      }, (err) => {
        log.info('findRidepoolMatches err: ' + err)
        res.status(400).send(err)
      })
    }, (err) => {
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

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
