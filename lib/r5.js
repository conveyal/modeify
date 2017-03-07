const geoTz = require('geo-tz')
const fetch = require('isomorphic-fetch')
const moment = require('moment-timezone')

const config = require('./config')

module.exports.requestPlan = function (plan) {
  if (config.r5 || process.env.TEST_R5_URL) {
    const r5Url = config.r5 ? config.r5.url : process.env.TEST_R5_URL
    const timezoneName = geoTz.tz(plan.from.lat, plan.from.lon)
    if (!timezoneName) {
      return Promise.reject({
        error: true,
        message: 'Timezone could not be found at given coordinates'
      })
    }

    const variables = {
      fromLat: plan.from.lat,
      fromLon: plan.from.lon,
      toLat: plan.to.lat,
      toLon: plan.to.lon,
      fromTime: toISO8061({ date: plan.date, time: plan.fromTime, timezoneName }),
      toTime: toISO8061({ date: plan.date, time: plan.toTime, timezoneName })
    }
    const startTime = Date.now()
    const query = buildQuery(plan)
    return fetch(r5Url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
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
  transitModes,
  bikeTrafficStress
}) {
  const r5TransitModes = transitModes.replace('TRAINISH', 'RAIL,SUBWAY,TRAM') // hangover from OTP
  const r5EgressModes = egressModes.replace('BICYCLE_RENT', '')
  return `query requestPlan($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $fromTime: ZonedDateTime!, $toTime: ZonedDateTime!) {
    plan(minBikeTime: 1, bikeTrafficStress: ${bikeTrafficStress}, fromLat: $fromLat, fromLon: $fromLon, toLat: $toLat, toLon: $toLon, fromTime: $fromTime, toTime: $toTime, directModes: [${directModes}], accessModes: [${accessModes}], egressModes: [${r5EgressModes}], transitModes: [${r5TransitModes}]) {
      patterns {
        tripPatternIdx
        routeId
        routeIdx
        directionId
        stops {
          stopId
          name
          lat
          lon
        }
        trips {
          tripId
          serviceId
          bikesAllowed
        }
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
            stopId
            lon
            lat
          }
          to {
            name
            stopId
            lon
            lat
          }
          mode
          routes {
            id
            description
            routeIdx
            shortName
            mode
            routeColor
            textColor
            url
            agencyName
          }
          segmentPatterns {
            patternId
            patternIdx
            routeIdx
            fromIndex
            toIndex
            nTrips
            fromArrivalTime
            fromDepartureTime
            toArrivalTime
            toDepartureTime
            tripId
          }
          middle {
            mode
            duration
            distance
            geometryPolyline
          }
          rideStats {
            min
            avg
            max
            num
          }
          waitStats {
            min
            avg
            max
            num
          }
        }
        access {
          mode
          duration
          distance
          streetEdges {
            edgeId
            geometryPolyline
            distance
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
            bikeRentalOffStation {
              id
              name
              lat
              lon
            }
            parkRide {
              id
              name
              capacity
              lon
              lat
            }
          }
        }
        egress {
          mode
          duration
          distance
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
        fares {
          type
          low
          peak
          senior
          transferReduction
          currency
        }
      }
    }
  }`
}

function toISO8061 ({
  date,
  time,
  timezoneName
}) {
  if (parseInt(time) < 10) time = `0${time}`
  return moment.tz(`${date}T${time}:00`, timezoneName).toISOString()
}
