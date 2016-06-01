var filePicker = require('component-file-picker')
var L = require('mapbox.js')

require('leaflet.markercluster')

var csvToArray = require('../../components/trevorgerhardt/csv-to-array/0.0.2')
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
      var commuters = csvToArray(text)
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
