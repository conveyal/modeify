const fetch = require('isomorphic-fetch')
const tzwhere = require('tzwhere')

const config = require('./config')

// tzwhere.init()

module.exports.requestPlan = function (plan) {
  if (config.r5) {
    const timezoneOffset = -4 // millisecondsToHours(tzwhere.tzOffsetAt(plan.from.lat, plan.from.lng))
    const variables = {
      fromLat: plan.from.lat,
      fromLon: plan.from.lng,
      toLat: plan.to.lat,
      toLon: plan.to.lng,
      fromTime: toISO8061({ date: plan.date, time: plan.fromTime, timezoneOffset }),
      toTime: toISO8061({ date: plan.date, time: plan.toTime, timezoneOffset })
    }
    const startTime = Date.now()
    return fetch(config.r5.url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: buildQuery(plan),
        variables: JSON.stringify(variables)
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.errors) {
          json.error = true
          json.message = Array.isArray(json.errors)
            ? json.errors.map((e) => `${e.message}\n`)
            : json.errors
        } else {
          json = json.data.plan
        }
        json.responseTime = Date.now() - startTime
        return json
      })
      .catch((err) => {
        console.error(err.stack)
        return {
          error: true,
          message: err.message,
          responseTime: Date.now() - startTime,
          errors: err.stack
        }
      })
  } else {
    return Promise.resolve({})
  }
}

function buildQuery ({
  accessModes,
  directModes,
  egressModes,
  transitModes
}) {
  const r5TransitModes = transitModes.replace('TRAINISH', 'RAIL,SUBWAY,TRAM') // hangover from OTP
  const r5EgressModes = egressModes.replace('BICYCLE_RENT', '')
  console.log(r5TransitModes)
  return `query requestPlan($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $fromTime: ZonedDateTime!, $toTime: ZonedDateTime!) {
    plan(fromLat: $fromLat, fromLon: $fromLon, toLat: $toLat, toLon: $toLon, fromTime: $fromTime, toTime: $toTime, directModes: [${directModes}], accessModes: [${accessModes}], egressModes: [${r5EgressModes}], transitModes: [${r5TransitModes}]) {
      patterns {
        tripPatternIdx
        routeId
        routeIdx
      }
      options {
        summary
        itinerary {
          waitingTime
          walkTime
          distance
          transfers
          duration
          transitTime
          startTime
          endTime
          connection {
            access
            egress
            transit {
              pattern
              time
            }
          }
        }
        transit {
          from {
            name
            code
            stopId
            zoneId
            lon
            lat
          }
          to {
            name
            code
            stopId
            zoneId
            lon
            lat
          }
          mode
          routes {
            id
            routeIdx
            shortName
            mode
          }
          segmentPatterns {
            patternIdx
            routeIdx
            fromIndex
            toIndex
            fromDepartureTime
            toArrivalTime
          }
          middle {
            mode
            duration
            distance
            geometryGeoJSON
          }
        }
        access {
          mode
          duration
          distance
          geometryWKT
          streetEdges {
            edgeId
            distance
            geometryWKT
            mode
            streetName
            relativeDirection
            absoluteDirection
            stayOn
            area
            exit
            bogusName
            bikeRentalOnStation {
              id
              name
              lat
              lon
            }
          }
        }
        egress {
          mode
          streetEdges {
            edgeId
            distance
            geometryPolyline
            mode
            streetName
            relativeDirection
            absoluteDirection
            stayOn
            area
            exit
            bogusName
            bikeRentalOnStation {
              id
              name
              lon
              lat
            }
          }
        }
      }
    }
  }`
}

function toISO8061 ({
  date,
  time,
  timezoneOffset
}) {
  if (parseInt(time) < 10) time = `0${time}`
  return `${date}T${time}:00${timezoneOffset > 0 ? '+' : '-'}${timezoneOffset < 10 && timezoneOffset > -10 ? '0' : ''}${Math.abs(timezoneOffset)}:00`
}

function millisecondsToHours (ms) {
  return ms / 1000 / 60 / 60
}
