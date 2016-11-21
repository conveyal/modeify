const fetch = require('isomorphic-fetch')
const tzwhere = require('tzwhere')

const config = require('./config')

// tzwhere.init()

module.exports.requestPlan = function (plan) {
  if (config.r5) {
    const timezoneOffset = -4 // millisecondsToHours(tzwhere.tzOffsetAt(plan.from.lat, plan.from.lng))
    const variables = {
      fromLat: plan.from.lat,
      fromLon: plan.from.lon,
      toLat: plan.to.lat,
      toLon: plan.to.lon,
      fromTime: toISO8061({ date: plan.date, time: plan.fromTime, timezoneOffset }),
      toTime: toISO8061({ date: plan.date, time: plan.toTime, timezoneOffset }),
      walkSpeed: plan.walkSpeed,
      bikeSpeed: plan.bikeSpeed
    }
    const startTime = Date.now()
    const query = buildQuery(plan)
    return fetch(config.r5.url, {
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
  return `query requestPlan($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $fromTime: ZonedDateTime!, $toTime: ZonedDateTime!, $bikeSpeed:Float!, $walkSpeed:Float!) {
    plan(minBikeTime: 1, bikeTrafficStress: ${bikeTrafficStress}, fromLat: $fromLat, fromLon: $fromLon, toLat: $toLat, toLon: $toLon, fromTime: $fromTime, toTime: $toTime, directModes: [${directModes}], accessModes: [${accessModes}], egressModes: [${r5EgressModes}], transitModes: [${r5TransitModes}], bikeSpeed: $bikeSpeed, walkSpeed: $walkSpeed) {
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
  timezoneOffset
}) {
  if (parseInt(time) < 10) time = `0${time}`
  return `${date}T${time}:00${timezoneOffset > 0 ? '+' : '-'}${timezoneOffset < 10 && timezoneOffset > -10 ? '0' : ''}${Math.abs(timezoneOffset)}:00`
}

function millisecondsToHours (ms) {
  return ms / 1000 / 60 / 60
}
