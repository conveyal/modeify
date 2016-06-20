const {Router} = require('express')

const CommuterLocations = require('../commuter-locations/model')
const ll = require('lonlng')
const otp = require('../otp')
const r5 = require('../r5')
const Ridepool = require('../ridepool/model')

const app = Router()

module.exports = app

app.get('/', function (req, res) {
  const from = parseLLString(req.query.from)
  const to = parseLLString(req.query.to)
  const qs = req.url.split('?')[1]

  const plans = [
    otp.profile(qs),
    otp.routes(),
    r5.requestPlan({
      from,
      to,
      date: req.query.date,
      fromTime: req.query.startTime,
      toTime: req.query.endTime,
      accessModes: req.query.accessModes,
      directModes: req.query.directModes,
      egressModes: req.query.egressModes,
      transitModes: req.query.transitModes
    }),
    Ridepool.findMatches(ll.toCoordinates(from), ll.toCoordinates(to))
  ]

  if (req.user) {
    plans.push(CommuterLocations.findLocationsForCommuter(req.user.id))
  }

  let data = {}
  Promise
    .all(plans)
    .then(([profile, routes, r5, ridepoolMatches, internalMatches]) => {
      profile.options = profile.options.filter((o) => {
        return o.stats && o.stats.avg !== 0
      })

      data = {
        externalMatches: 0,
        internalMatches,
        profile: profile.options,
        r5,
        responseTime: profile.responseTime,
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
      res.status(400).send({
        message: err.message,
        stack: err.stack
      })
    })
})

function parseLLString (str) {
  const arr = str.split(',')
  return ll([arr[1], arr[0]])
}
