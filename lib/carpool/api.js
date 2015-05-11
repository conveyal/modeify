import {findMatches as commuterConnectionsMatches} from 'commuter-connections'
import express from 'express'

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

function parseFloatArray (str) {
  let array = []
  if (str && str.length > 0) {
    array = str.split(',').map(parseFloat)
  }
  return array
}
