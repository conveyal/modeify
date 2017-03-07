var hogan = require('hogan.js')
var session = require('../session')
var toSentenceCase = require('to-sentence-case')
var view = require('../view')
var each = require('component-each')

var rowTemplate = require('./row.html')
var template = require('./template.html')

var row = hogan.compile(rowTemplate)

var View = module.exports = view(template, function (view, route) {
  route.on('generatedStopTimes', function () {
    route.emit('change itinerary')
  })
})

/**
 * To/from
 */

View.prototype.from = function () {
  return session.plan().from().split(',')[0]
}
View.prototype.to = function () {
  return session.plan().to().split(',')[0]
}

/**
 * Details, details
 */

View.prototype.itinerary = function () {
  var access = this.model.access()[0]
  var egress = this.model.egress()
  var segments = this.model.transit()
  var length = segments.length
  var details = ''

  // Add a detail
  function addDetail (d) {
    details += row.render(d)
  }

  details += narrativeDirections(access.streetEdges)

  // Add transit segments
  var lastColor = null
  for (var i = 0; i < length; i++) {
    var segment = segments[i]
    var departureTimes = segment.departureTimes || []
    var fromName = segment.fromName
    var patterns = segment.segmentPatterns
    var color = patterns[0].color
    var routeAgencyNames = {}
    each(segment.routes, function (route) {
      routeAgencyNames[route.id] = route.agencyName
    })

    // Check for a walking distance to see if you are boarding or transferring
    if (segment.walkTime !== 0 || i === 0) {
      if (i > 0) {
        addDetail({
          description: 'Walk ' + (Math.ceil(segment.walkTime / 60) + 1) + ' min',
          icon: 'walk'
        })
      }

      addDetail({
        color: color,
        description: strong(fromName),
        transfer: 'transfer board'
      })
    } else {
      addDetail({
        color: 'linear-gradient(to bottom, ' + lastColor + ' 0%, ' +
          lastColor + ' 50%,' + color + ' 50%, ' + color + ' 100%)',
        description: strong(fromName),
        transfer: 'transfer'
      })
    }

    addDetail({
      color: color,
      departureTimes: formatDepartureTimes(departureTimes),
      description: 'Take ' + getRouteNames(segment.routes),
      segment: true
    })

    // Check if you are deboarding
    if (i + 1 >= length || segments[i + 1].walkTime > 0) {
      addDetail({
        color: color,
        description: strong(segment.toName),
        transfer: 'transfer alight'
      })
    }

    lastColor = color
  }

  if (egress && egress.length > 0) {
    details += narrativeDirections(egress[0].streetEdges)
  }

  return details
}

function getRouteNames (routes) {
  var agencyRoutes = {} // maps agency name to array of routes
  routes.forEach(function (r) {
    var agencyName = r.agencyName
    // FIXME: fix this in the R5 response
    if (!agencyName || agencyName === 'UNKNOWN') {
      agencyName = r.id.split(':')[0]
      agencyName = agencyName.substring(0, agencyName.length - 54)
    }
    if (!(agencyName in agencyRoutes)) {
      agencyRoutes[agencyName] = []
    }
    agencyRoutes[agencyName].push(r)
  })
  var agencyStrings = []
  for (var agencyName in agencyRoutes) {
    var rtes = agencyRoutes[agencyName]
    // TODO: handle DC-specific behavior via config
    var displayName = (agencyName === 'MET' || agencyName === 'WMATA')
      ? rtes[0].mode === 'SUBWAY'
        ? 'Metrorail'
        : 'Metrobus'
      : getAgencyName(agencyName)
    displayName = displayName.replace('_', ' ') // FIXME: shouldn't be necessary after R5 API fix
    agencyStrings.push(displayName + ' ' + rtes.map(function (r) { return r.shortName }).join('/'))
  }
  return agencyStrings.join(', ')
}

function getAgencyName (internalName) {
  switch (internalName) {
    case 'MET': return 'Metro'
    case 'Arlington Transit': return 'ART'
    case 'Maryland Transit Administration': return 'MTA'
    case 'Potomac and Rappahannock Transportation Commission': return 'PRTC'
    case 'Virginia Railway Express': return 'VRE'
    case 'Montgomery County MD Ride On': return 'Ride On'
    case 'Alexandria Transit Company (DASH)': return 'DASH'
  }
  return internalName
}

function strong (s) {
  return '<strong>' + s + '</strong>'
}

function formatDepartureTimes (times) {
  var hours = {}
  var maxPerHour = 0
  var text = ''

  if (!times || times.length < 1) return

  times = times.map(function (t) {
    return new Date(t)
  })

  times.forEach(function (t) {
    var h = t.getHours()
    if (hours[h] === undefined) hours[h] = []
    hours[h].push(t.getMinutes())
    maxPerHour = hours[h].length > maxPerHour ? hours[h].length : maxPerHour
  })

  if (maxPerHour > 6) {
    var startDate = times[0]
    var endDate = times[times.length - 1]
    var freq = parseInt((endDate - startDate) / 1000 / 60 / times.length, 10)

    text += '<br>' + toLocale(startDate) + ' to ' + toLocale(endDate) + ' every ' + freq + ' min'
  } else {
    for (var i in hours) {
      text += '<br><strong>'
      if (i > 12) {
        text += String(i - 12)
      } else if (i === 0) {
        text += '12'
      } else {
        text += String(i)
      }

      text += '</strong> '

      text += hours[i].map(function (m) {
        if (m < 10) return '<strong>:</strong>0' + m
        else return '<strong>:</strong>' + m
      }).join('&nbsp;&nbsp;&nbsp;')

      if (i > 12) {
        text += '&nbsp;&nbsp;&nbsp;PM'
      } else {
        text += '&nbsp;&nbsp;&nbsp;AM'
      }
    }
  }

  return text
}

function toLocale (d) {
  return d.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
}

/**
 * Add narrative directions
 */

function narrativeDirections (edges) {
  if (!edges) return ''

  return edges.map(function (se) {
    if (!se.streetName && !se.bikeRentalOffStation) {
      return ''
    }

    const linkOrPath = se.streetName === 'Link' || se.streetName === 'Path'
    if (linkOrPath || se.relativeDirection === 'CONTINUE') {
      return ''
    }

    const streetSuffix = ' on ' + se.streetName
    const step = {}
    if (se.bikeRentalOnStation) {
      step.description = 'Rent bike from ' + se.bikeRentalOnStation.name + ' and ride ' + se.absoluteDirection.toLowerCase() + streetSuffix
      step.icon = 'cabi'
    } else if (se.bikeRentalOffStation) {
      step.description = 'Park bike at ' + se.bikeRentalOffStation.name
      step.icon = 'cabi'
    } else if (se.mode) {
      step.description = MODE_TO_ACTION[se.mode] + ' ' + se.absoluteDirection.toLowerCase() + streetSuffix
      step.icon = MODE_TO_ICON[se.mode]
    } else {
      step.description = toSentenceCase(se.relativeDirection) + streetSuffix
      step.direction = DIRECTION_TO_CARDINALITY[se.relativeDirection]
    }

    return row.render(step)
  }).join('')
}

var MODE_TO_ACTION = {
  BICYCLE: 'Bike',
  BICYCLE_RENT: 'Bike',
  CAR: 'Drive',
  CAR_PARK: 'Drive',
  WALK: 'Walk'
}

var MODE_TO_ICON = {
  BICYCLE: 'bike',
  BICYCLE_RENT: 'cabi',
  CAR: 'car',
  CAR_PARK: 'car',
  WALK: 'walk'
}

var DIRECTION_TO_CARDINALITY = {
  CIRCLE_COUNTERCLOCKWISE: 'fa-repeat fa-flip-horizontal',
  HARD_LEFT: 'fa-arrow-left',
  HARD_RIGHT: 'fa-arrow-right',
  RIGHT: 'fa-arrow-right',
  LEFT: 'fa-arrow-left',
  CONTINUE: 'fa-arrow-up',
  SLIGHTLY_RIGHT: 'fa-arrow-right fa-northeast',
  SLIGHTLY_LEFT: 'fa-arrow-right fa-northwest',
  UTURN_LEFT: 'fa-repeat fa-flip-horizontal',
  UTURN_RIGHT: 'fa-repeat'
}
