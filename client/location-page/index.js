var filePicker = require('component-file-picker')
var L = require('mapbox.js')
var parse = require('csv-parse/lib/sync')
require('leaflet.markercluster')

var file = require('component-file')
var log = require('../log')('location-page')
var map = require('../map')
var spin = require('../spinner')
var view = require('../view')

var CommuterRow = require('./commuter')
var Modal = require('./modal')
var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  log('render')

  ctx.location.commuterLocations = ctx.commuterLocations
  ctx.view = new View(ctx.location, {
    organization: ctx.organization
  })
  ctx.view.on('rendered', function (view) {
    var m = map(view.find('.map'), {
      center: ctx.location.coordinate(),
      zoom: 13
    })
    m.addLayer(ctx.location.mapMarker())

    if (ctx.location.commuterLocations.length > 0) {
      var cluster = new L.MarkerClusterGroup()
      ctx.location.commuterLocations.forEach(function (cl) {
        if (cl._commuter.validCoordinate()) {
          cluster.addLayer(cl._commuter.mapMarker())
        }
      })

      if (cluster.getBounds()._northEast) {
        m.addLayer(cluster)
      }
    }
  })

  next()
}

View.prototype.commuterCount = function () {
  return this.model.commuterLocations.length
}

View.prototype.organizationName = function () {
  return this.options.organization.get('name')
}

View.prototype['commuterLocations-view'] = function () {
  return CommuterRow
}

/**
 * Upload CSV
 */

View.prototype.parseCSV = function (e) {
  var view = this
  var spinner = spin()
  filePicker({
    accept: ['.csv']
  }, function (files) {
    var csv = file(files[0])
    csv.toText(function (err, text) {
      if (err) log.error(err)
      spinner.remove()
      var commuters = parse(text, {columns: true})
      view.showConfirmUpload(commuters.filter(function (commuter) {
        return commuter.email && commuter.email.length >= 5
      }))
    })
  })
}

/**
 * Confirm Upload
 */

View.prototype.showConfirmUpload = function (commuters) {
  var modal = new Modal({
    commuters: commuters,
    location: this.model,
    organization: this.options.organization
  })
  document.body.appendChild(modal.el)
}

View.prototype.profileAndMatch = function () {
  this.model.profileAndMatch(function (err) {
    if (err) {
      window.alert('Failed to profile commuters.')
    } else {
      window.alert('Profiling commuters. Please come back in a few minutes to see the results.')
    }
  })
}

View.prototype.sendPlansAndMatches = function () {
  this.model.sendPlansAndMatches(function (err) {
    if (err) {
      console.error(err)
      window.alert('Failed to send plans.')
    } else {
      window.alert('Sending plans to your commuters. They should arrive shortly!')
    }
  })
}

View.prototype.downloadMatches = function () {
  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += 'commuter1_first,commuter1_last,commuter1_email,commuter2_first,commuter2_last,commuter2_email,distance\n'

  let matchedKeys = []

  this.model.commuterLocations.forEach((cl) => {
    if (cl.matches && cl.matches.length > 0) {
      cl.matches.forEach((match) => {
        const matchedCl = this.model.commuterLocations.find(cl => cl._commuter.get('_id') === match._id)
        if (!matchedCl) {
          console.err('could not find commuter ' + match._id)
          return
        }
        const id1 = cl._commuter.get('_id')
        const id2 = matchedCl._commuter.get('_id')
        const matchKey = id1 < id2 ? id1 + ':' + id2 : id2 + ':' + id1
        if (matchedKeys.indexOf(matchKey) !== -1) return
        matchedKeys.push(matchKey)

        let row = []
        row.push(cl._commuter.get('givenName'))
        row.push(cl._commuter.get('surname'))
        row.push(cl._commuter.get('email'))
        row.push(matchedCl._commuter.get('givenName'))
        row.push(matchedCl._commuter.get('surname'))
        row.push(matchedCl._commuter.get('email'))
        row.push(match.distance)

        const rowText = row.join(',')
        csvContent += rowText + '\n'
      })
    }
  })
  var encodedUri = encodeURI(csvContent)
  var link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'matches.csv')
  document.body.appendChild(link) // Required for FF
  link.click()
}
