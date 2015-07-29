import {findMatches as commuterConnectionsMatches} from 'commuter-connections'

import express from 'express'

import Ridepool from '../ridepool/model'
import {findRidepoolMatches} from 'ridematcher'

import Location from '../location/model'

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
      Ridepool.populate(ridepools, 'from to', function(err, ridepools){

        // filter ridepools by visibility & valid from/to locations
        ridepools = ridepools.filter(function(ridepool) {
          return ridepool.from && ridepool.to && ridepool.visibility === 'public';
          // TODO: check for internally visible ridepools
        })

        // convert ridepool list to format expected by ridematcher.js
        ridepools = ridepools.map(function(ridepool) {
          return {
            _id: ridepool._id,
            name: ridepool.name,
            from: [ridepool.from.coordinate.lng, ridepool.from.coordinate.lat],
            to: [ridepool.to.coordinate.lng, ridepool.to.coordinate.lat]
          }
        })

        findRidepoolMatches([startLng, startLat], [endLng, endLat], ridepools).then((matches) => {
          res.status(200).json(matches)
        }, (err) => {
          log.info('findRidepoolMatches err: ' + err)
          res.status(400).send(err)
        })
      });
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
