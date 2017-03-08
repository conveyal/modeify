const {Router} = require('express')
const ll = require('lonlng')
const Scorer = require('otp-profile-score')

const CommuterLocations = require('../commuter-locations/model')
const otp = require('../otp')
const r5 = require('../r5')
const Ridepool = require('../ridepool/model')

const profileFilter = require('./profile-filter')
const profileFormatter = require('./profile-formatter')
const profileToTransitive = require('./profile-to-transitive')
const r5toOtp = require('./r5-to-otp')

const config = require('../config')

const app = Router()
const scorer = new Scorer()

module.exports = app

app.get('/', function (req, res) {
  const from = ll(req.query.from)
  const to = ll(req.query.to)

  const foundOtpConfig = config.otp !== undefined && config.otp.host !== undefined
  const foundR5Config = config.r5 !== undefined && config.r5.url !== undefined

  let queryOtp
  let queryR5

  if (foundOtpConfig && !foundR5Config) { // Only OTP server is present in config
    queryOtp = true
    queryR5 = false
  } else if (foundOtpConfig && !foundR5Config) { // Only R5 server is present in config
    queryOtp = false
    queryR5 = true
  } else { // defer to query params
    queryOtp = req.query.queryOtp === 'true'
    queryR5 = req.query.queryR5 === 'true'
  }
  let plans = []

  // construct the OTP queries, if applicable
  if (queryOtp) {
    // serialize the query string
    const otpQuery = Object.assign({}, req.query, {
      from: `${from.lat},${from.lon}`,
      to: `${to.lat},${to.lon}`
    })
    const str = []
    for (var p in otpQuery) {
      if (otpQuery.hasOwnProperty(p) && p !== 'queryOtp' && p !== 'queryR5') {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(otpQuery[p]))
      }
    }
    const qs = str.join('&')

    plans = plans.concat([otp.profile(qs), otp.routes()])
  } else {
    plans = plans.concat([null, null])
  }

  // construct the R5 query, if applicable
  if (queryR5) {
    plans.push(r5.requestPlan({
      from,
      to,
      date: req.query.date,
      fromTime: req.query.startTime,
      toTime: req.query.endTime,
      accessModes: req.query.accessModes,
      directModes: req.query.directModes,
      egressModes: req.query.egressModes,
      transitModes: req.query.transitModes,
      bikeTrafficStress: req.query.bikeTrafficStress,
      bikeSpeed: req.query.bikeSpeed,
      walkSpeed: req.query.walkSpeed
    }))
  } else {
    plans.push(null)
  }

  // construct other queries
  plans.push(Ridepool.findMatches(ll.toCoordinates(from), ll.toCoordinates(to)))

  if (req.user) {
    plans.push(CommuterLocations.findLocationsForCommuter(req.user.id))
  }

  let data = {}
  Promise
    .all(plans)
    .then(([profile, routes, r5, ridepoolMatches, internalMatches]) => {
      data = {
        externalMatches: 0,
        internalMatches,
        r5,
        ridepoolMatches
      }

      if (!queryOtp) return null

      profile.options = profile.options.filter((o) => {
        return o.stats && o.stats.avg !== 0
      })
      data.otp = {
        profile: profile.options,
        responseTime: profile.responseTime,
        routes
      }

      return otp.patternsFromProfile(data.otp.profile)
    })
    .then(patterns => {
      if (!queryOtp) return null

      data.otp.patterns = patterns

      // Populate the transit segments in the profile
      otp.populateTransitSegments(data.otp.profile, data.otp.patterns, data.otp.routes)

      // Populate the stop times
      return otp.populateStopTimes(data.otp.profile, req.query.date, parseInt(req.query.startTime, 10), parseInt(req.query.endTime, 10))
    })
    .then(() => {
      const responseBody = {
        externalMatches: 0,
        internalMatches: data.internalMatches,
        ridepoolMatches: data.ridepoolMatches
      }

      if (queryOtp) {
        const otpProfile = profileFilter(data.otp.profile, scorer, true)
        const otpd = profileFormatter.journey(profileToTransitive({
          from,
          to,
          patterns: data.otp.patterns,
          options: otpProfile,
          routes: data.otp.routes
        }))

        responseBody.otp = Object.assign({}, otpd, {
          profile: otpProfile,
          responseTime: data.otp.responseTime
        })
      }

      if (queryR5) {
        const r5 = r5toOtp(data.r5)
        const r5Profile = profileFilter(r5.profile, scorer, true)
        const r5d = profileFormatter.journey(profileToTransitive({
          from,
          to,
          patterns: r5.patterns,
          options: r5Profile,
          routes: r5.routes
        }))

        responseBody.r5 = Object.assign({}, r5d, {
          profile: r5Profile,
          responseTime: data.r5.responseTime
        })
      }

      res.status(200).send(responseBody)
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send({
        message: err.message,
        stack: err.stack
      })
    })
})
