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
var ConfirmModal = require('confirm-modal')

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
      var cluster = new window.L.MarkerClusterGroup()
      ctx.location.commuterLocations.forEach(function (cl) {
        if (cl._commuter.validCoordinate()) cluster.addLayer(cl._commuter.mapMarker())
      })

      if (cluster.getBounds()._northEast) {
        m.addLayer(cluster)
      }
    }
  })

  next()
}

var CommuterRow = view(require('./commuter.html'))

CommuterRow.prototype.organizationId = function () {
  return this.model._commuter._organization()
}

CommuterRow.prototype.locationId = function () {
  return this.model._location._id()
}

CommuterRow.prototype.commuterId = function () {
  return this.model._commuter._id()
}

CommuterRow.prototype.status = function () {
  var commuter = this.model._commuter
  var status = commuter.status() || ' '
  var label = commuter.statusLabel() || 'default'
  return '<span class="label label-' + label + '">' + status + '</span>'
}

CommuterRow.prototype.name = function () {
  var user = this.model._commuter.account()
  if (user && user.email) {
    return this.model._commuter.name() || user.email
  } else {
    return this.model._commuter.name()
  }
}

CommuterRow.prototype.remove = function () {
  var self = this
  ConfirmModal({
    text: 'Are you sure want to delete ' + this.name() + '?'
  }, function () {
    CommuterLocation.remove(self.model._id, function (err) {
      if (err) {
        console.error(err)
        window.alert(err)
      } else {
        self.el.remove()
      }
    })
  })
}

CommuterRow.prototype.sendProfileAndMatches = function () {
  var name = this.model._commuter.name() || this.model._commuter.account().email
  CommuterLocation.sendProfileAndMatches(this.model._id, function (err) {
    if (err) {
      console.error(err)
      window.alert(err)
    } else {
      window.alert('Commute profile and plans have been sent to ' + name + '!')
    }
  })
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
