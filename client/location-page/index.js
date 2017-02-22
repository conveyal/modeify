var filePicker = require('component-file-picker')
var parse = require('csv-parse/lib/sync')

var L = require('leaflet')
require('leaflet.markercluster')

var file = require('component-file')
var log = require('../log')('location-page')
var map = require('../map')
var spin = require('../spinner')
var view = require('../view')
var alerts = require('../alerts')
var page = require('page')

var CommuterRow = require('./commuter')
var CommuterUploadModal = require('./commuter-upload-modal')
var CommuterConfirmModal = require('./commuter-confirm-modal')
var View = view(require('./template.html'))
var ConfirmModal = require('../confirm-modal')
var CommuterLocation = require('../commuter-location')

var pageSize = 100

module.exports = function (ctx, next) {
  log('render')

  var model = ctx.location
  model.page = 0
  model.pageCount = Math.ceil(ctx.location.commuter_count() / pageSize)

  ctx.view = new View(model, {
    organization: ctx.organization
  })

  ctx.view.on('rendered', function (view) {
    view.loadCoordinates()
    view.loadPage()

    var m = map(view.find('.location-map'), {
      center: ctx.location.coordinate(),
      zoom: 13
    })
    m.addLayer(ctx.location.mapMarker())

    view.mapp = m
  })

  next()
}

View.prototype.loadPage = function () {
  var self = this
  var spinner = spin()
  CommuterLocation.forLocationPaged(this.model.get('_id'), this.model.page, pageSize, function (err, cls) {
    spinner.remove()
    if (err) {
      console.log('Error loading page of commuters', err)
    } else {
      self.model.commuterLocations = cls
      self.model.emit('change commuterLocations')
    }
  })
}

View.prototype.loadCoordinates = function () {
  var self = this
  CommuterLocation.coordinatesForLocation(this.model.get('_id'), function (err, coords) {
    if (err) {
      console.log('Error loading commuter coordinates', err)
    } else {
      try {
        var cluster = L.markerClusterGroup()
        coords.forEach(function (coord) {
          if (!coord || !coord.lat || !coord.lng) return
          cluster.addLayer(map.createMarker({
            color: '#5cb85c',
            coordinate: [coord.lng, coord.lat],
            icon: 'home',
            size: 14
          }))
        })
      } catch (err) {
        console.log(err)
      }

      if (cluster.getBounds()._northEast) {
        self.mapp.addLayer(cluster)
      }
    }
  })
}

View.prototype.previousPage = function () {
  if (this.model.page <= 0) return
  this.model.page = this.model.page - 1
  this.model.emit('change page')
  this.loadPage(this.model.page)
}

View.prototype.nextPage = function () {
  if (this.model.page >= this.model.pageCount - 1) return
  this.model.page = this.model.page + 1
  this.model.emit('change page')
  this.loadPage(this.model.page)
}

View.prototype.commuterCount = function () {
  return this.model.get('commuter_count')
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
  filePicker({
    accept: ['.csv']
  }, function (files) {
    var csv = file(files[0])
    csv.toText(function (err, text) {
      if (err) log.error(err)
      var commuters = parse(text, {columns: true})
      view.showUploadModal(commuters)
    })
  })
}

View.prototype.showUploadModal = function (rawCommuterData) {
  var view = this

  var commuterUploadModal = new CommuterUploadModal({
    rawCommuterData: rawCommuterData,
    location: this.model,
    organization: this.options.organization
  }, {
    onContinue: function (commuterData) {
      view.showConfirmUpload(commuterData)
    }
  })
  document.body.appendChild(commuterUploadModal.el)
}

/**
 * Confirm Upload
 */

View.prototype.showConfirmUpload = function (commuterData) {
  var modal = new CommuterConfirmModal({
    commuters: commuterData,
    location: this.model,
    organization: this.options.organization
  })
  document.body.appendChild(modal.el)
}

View.prototype.match = function () {
  var spinner = spin()
  var self = this
  this.model.match(function (err) {
    spinner.remove()
    if (err) {
      ConfirmModal({
        text: 'Failed to match commuters.',
        showCancel: false
      })
    } else {
      alerts.push({
        type: 'success',
        text: 'Completed ridematching.'
      })
      page('/manager/organizations/' + self.options.organization._id() + '/locations/' + self.model._id() + '/show')
    }
  })
}

View.prototype.profile = function () {
  this.model.profile(function (err) {
    if (err) {
      ConfirmModal({
        text: 'Failed to profile commuters.',
        showCancel: false
      })
    } else {
      ConfirmModal({
        text: 'Profiling commuters. Please come back in a few minutes to see the results.',
        showCancel: false
      })
    }
  })
}

View.prototype.profileAndMatch = function () {
  this.model.profileAndMatch(function (err) {
    if (err) {
      ConfirmModal({
        text: 'Failed to profile commuters.',
        showCancel: false
      })
    } else {
      ConfirmModal({
        text: 'Profiling commuters. Please come back in a few minutes to see the results.',
        showCancel: false
      })
    }
  })
}

View.prototype.sendPlansAndMatches = function () {
  this.model.sendPlansAndMatches(function (err) {
    if (err) {
      console.error(err)
      ConfirmModal({
        text: 'Failed to send plans.',
        showCancel: false
      })
    } else {
      ConfirmModal({
        text: 'Sending plans to your commuters. They should arrive shortly!',
        showCancel: false
      })
    }
  })
}

View.prototype.downloadMatches = function () {
  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += 'commuter1_first,commuter1_last,commuter1_email,commuter1_internalId,commuter2_first,commuter2_last,commuter2_email,commuter2_internalId,distance\n'

  const matchedKeys = []

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

        const row = []
        row.push(cl._commuter.get('givenName'))
        row.push(cl._commuter.get('surname'))
        row.push(cl._commuter.get('email'))
        row.push(cl._commuter.get('internalId'))
        row.push(matchedCl._commuter.get('givenName'))
        row.push(matchedCl._commuter.get('surname'))
        row.push(matchedCl._commuter.get('email'))
        row.push(matchedCl._commuter.get('internalId'))
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

View.prototype.showSmallMap = function () {
  this.changeMapSize('small')
}

View.prototype.showMediumMap = function () {
  this.changeMapSize('medium')
}

View.prototype.showLargeMap = function () {
  this.changeMapSize('large')
}

View.prototype.changeMapSize = function (size) {
  var mapDiv = this.find('.map')
  mapDiv.classList.remove('map-small')
  mapDiv.classList.remove('map-medium')
  mapDiv.classList.remove('map-large')
  mapDiv.classList.add('map-' + size)
  this.mapp.map.invalidateSize()
}

View.prototype.showFullScreenMap = function () {
  // show the fullscreen container
  var fsDiv = this.find('.fullscreen-map')
  fsDiv.style.visibility = 'visible'

  // attach the leaflet map to the fullscreen container
  var mapDiv = this.find('.location-map')
  fsDiv.appendChild(mapDiv)
  this.mapp.map.invalidateSize()
}

View.prototype.hideFullScreenMap = function () {
  // hide the fullscreen container
  var fsDiv = this.find('.fullscreen-map')
  fsDiv.style.visibility = 'hidden'

  // reattach the the leaflet map to the inline container
  this.find('.map-container').appendChild(this.find('.location-map'))
  this.mapp.map.invalidateSize()
}
