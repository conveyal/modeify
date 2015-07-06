var alerts = require('alerts')
var CommuterLocation = require('commuter-location')
var csvToArray = require('csv-to-array')
var each = require('each')
var file = require('file')
var filePicker = require('file-picker')
var log = require('log')('location-page')
var map = require('map')
var spin = require('spinner')
var value = require('value')
var view = require('view')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  log('render')

  ctx.location.commuters = ctx.commuters
  ctx.view = new View(ctx.location)
  ctx.view.on('rendered', function (view) {
    var m = map(view.find('.map'), {
      center: ctx.location.coordinate(),
      zoom: 13
    })
    m.addLayer(ctx.location.mapMarker())

    if (ctx.commuters.length > 0) {
      var cluster = new window.L.MarkerClusterGroup()
      ctx.commuters.forEach(function (commuter) {
        cluster.addLayer(commuter.mapMarker())
      })

      m.addLayer(cluster)
      m.fitLayers([m.featureLayer, cluster])
    }
  })

  next()
}

var CommuterRow = view(require('./commuter.html'))

CommuterRow.prototype.status = function () {
  var status = this.model.status
  var label = this.model.statusLabel()
  return '<span class="label label-' + label + '">' + status + '</span>'
}

View.prototype.commuterCount = function () {
  return this.model.commuters.length
}

View.prototype['commuters-view'] = function () {
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
 * Modal, Input
 */

var Input = view(require('./commuter-confirm-input.html'))
var Modal = view(require('./commuter-confirm-modal.html'))

/**
 * Confirm Upload
 */

View.prototype.showConfirmUpload = function (commuters) {
  var modal = new Modal({
    commuters: commuters,
    location: this.model
  })
  document.body.appendChild(modal.el)
}

View.prototype.profileAndMatch = function () {
  this.model.profileAndMatch(function (err) {
    if (err) {
      window.alert('Failed to profile commuters.')
    } else {
      window.alert('Profiling commuters.')
    }
  })
}

/**
 * Inputs
 */

Modal.prototype['commuters-view'] = function () {
  return Input
}

/**
 * Close
 */

Modal.prototype.close = function (e) {
  e.preventDefault()
  this.el.remove()
}

/**
 * Upload Commuters
 */

Modal.prototype.upload = function (e) {
  e.preventDefault()
  var modal = this
  var location = this.model

  var commuters = []
  each(modal.findAll('tr'), function (el) {
    // if confirm is unchecked, skip
    if (!value(el.querySelector('.confirm'))) return

    // get the other data
    commuters.push({
      address: el.querySelector('.address').textContent || '',
      email: (el.querySelector('.email').textContent || '').toLowerCase(),
      name: el.querySelector('.name').textContent || ''
    })
  })

  CommuterLocation.addCommuters(location._id(), commuters, function (err, res) {
    if (err) {
      log.error('%e', err)
      window.alert('Error while uploading commuters. ' + err)
    } else {
      alerts.push({
        type: 'success',
        text: 'Upload succesful, ' + res.length + ' commuters added to this location.'
      })
    }
    modal.el.remove()
  })
}
