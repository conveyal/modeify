const concat = require('concat-stream')
const http = require('http')

const {otp} = require('../config')
const log = require('../log')

module.exports.profile = function profile (query, date, startTime, endTime) {
  return request(`/profile?${query}`)
}

module.exports.routes = function routes () {
  return request('/index/routes')
}

const pattern = module.exports.pattern = function pattern (pattern) {
  return request('/index/patterns/' + encodeURIComponent(pattern))
}

const patterns = module.exports.patterns = function patterns (patterns) {
  return Promise.all(patterns.map(p => pattern(p)))
}

module.exports.patternsFromProfile = function patternsFromProfile (options) {
  return patterns(getUniquePatternIds(options))
}

module.exports.populateStopTimes = function populateStopTimes (options, date, startTime, endTime) {
  const dateString = date.replace(/-/g, '')
  return Promise.all(options
    .filter(filterNonTransitOptions)
    .reduce(aggregateSegments, [])
    .map(populateSegment))
    .then((departureTimes) => {
      return options
    })

  function populateSegment (segment) {
    const pattern = segment.segmentPatterns[0]
    return findDepartureTimes(pattern.patternId, pattern.stopId, dateString)
      .then((departureTimes) => {
        departureTimes.reduce((times, patternTimes) => {
          return times.concat(patternTimes)
        }, [])
        departureTimes.sort()
        segment.departureTimes = departureTimes.map(t => new Date(t)).filter(inTimeWindow)
        return Promise.resolve(segment)
      })
  }

  function inTimeWindow (time) {
    return time.getHours() >= startTime && time.getHours() < endTime
  }
}

const request = module.exports.request = function request (url) {
  return new Promise((resolve, reject) => {
    const options = {
      host: otp.host,
      method: 'GET',
      path: otp.path + url,
      port: otp.port
    }

    const startTime = Date.now()
    const creq = http.request(options, (cres) => {
      cres.setEncoding('utf8')
      cres.pipe(concat((data) => {
        if (cres.statusCode !== 200) {
          log.error('otp:error', {
            message: data,
            statusCode: cres.statusCode,
            url: otp.path + url
          })
          reject(data)
        } else {
          try {
            data = JSON.parse(data)
          } catch (e) {
            log.error('otp:parseerror', data)
            data = {
              id: data,
              options: [],
              routeId: '',
              stops: [],
              error: e
            }
            reject(data)
          }
          data.responseTime = Date.now() - startTime
          resolve(data)
        }
      }))
    }).on('error', reject)
    creq.end()
  })
}

function getUniquePatternIds (options) {
  // Iterate over each option and add the pattern if it does not already exist
  return findUniquePatternIds(aggregateSegmentPatterns(options))
}

function aggregateSegmentPatterns (options) {
  return aggregateTransitOptions(options).reduce((segmentPatterns, transit) => {
    if (transit && transit.segmentPatterns) {
      return segmentPatterns.concat(transit.segmentPatterns)
    } else {
      return segmentPatterns
    }
  }, [])
}

function aggregateTransitOptions (options) {
  return options.reduce((transit, option) => {
    return transit.concat(option.transit || [])
  }, [])
}

function findUniquePatternIds (segmentPatterns) {
  return segmentPatterns.reduce((ids, pattern) => {
    if (ids.indexOf(pattern.patternId) === -1) {
      return ids.concat(pattern.patternId)
    } else {
      return ids
    }
  }, [])
}

function filterNonTransitOptions (option) {
  return option.transit && option.transit.length > 0
}

function aggregateSegments (segments, option) {
  return segments.concat(option.transit)
}

function findDepartureTimes (patternId, stopId, date) {
  return request('/index/stops/' + encodeURIComponent(stopId) + '/stoptimes/' + date)
    .then((patterns) => {
      return patterns
        .filter(pattern => pattern.pattern.id === patternId)[0].times
        .map(t => {
          return (t.serviceDay + t.scheduledDeparture) * 1000
        })
    })
}

/**
 * Populate segments
 */

module.exports.populateTransitSegments = function populateTransitSegments (options, patterns, routes) {
  aggregateSegmentPatterns(options).forEach((segmentPattern) => {
    const patternId = segmentPattern.patternId
    const fullPattern = getPattern(patternId, patterns)
    const route = getRoute(fullPattern.routeId, routes)

    segmentPattern.stopId = fullPattern.stops[segmentPattern.fromIndex].id

    segmentPattern.longName = route.longName
    segmentPattern.shortName = route.shortName

    const [agency, line] = fullPattern.routeId.split(':')
    segmentPattern.color = '#' + (route.color ? route.color : getColor(agency, route.mode, line))
    segmentPattern.shield = getRouteShield(agency, route)
  })

  return options
}

function getPattern (id, patterns) {
  return patterns.find(p => p.id === id)
}

function getRoute (id, routes) {
  return routes.find(r => r.id === id)
}

function getColor (agency, mode, line) {
  return transitColors[agency] || transitColors[line] || transitColors[mode] || transitColors.METROBUS
}

/**
 * Predefined Transit Colors
 */

const transitColors = {
  '1': '55b848', // ART TODO: Dont have hacky agency
  'AGENCY#1': '55b848', // ART
  'AGENCY#3': '2c9f4b', // Maryland Commute Bus
  ART: '55b848',
  BLUE: '0076bf',
  CABI: 'd02228',
  'FAIRFAX CONNECTOR': 'ffff43',
  GREEN: '00a84f',
  MCRO: '355997',
  METROBUS: '173964',
  ORANGE: 'f7931d',
  PRTC: '5398a0',
  RED: 'e21836',
  SILVER: 'a0a2a0',
  YELLOW: 'ffd200'
}

function getRouteShield (agency, route) {
  if ((agency === 'DC' || agency.indexOf('WMATA') === 0) && route.mode === 'SUBWAY') return 'M'
  return route.shortName || route.longName
}
