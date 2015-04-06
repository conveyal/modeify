var alerts = require('alerts')
var Batch = require('batch')
var Commuter = require('commuter')
var csvToArray = require('csv-to-array')
var each = require('each')
var file = require('file')
var filePicker = require('file-picker')
var log = require('./client/log')('organization-page:view')
var page = require('page')
var spin = require('spinner')
var value = require('value')
var view = require('view')

/**
 * Expose `View`
 */

var View = module.exports = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Organization Page'
})

/**
 * Commuter View
 */

var CommuterRow = view(require('./commuter.html'))

/**
 * Commuter View
 */

View.prototype['commuters-view'] = function () {
  return CommuterRow
}

/**
 * Row labels
 */

CommuterRow.prototype.status = function () {
  var status = this.model.status()
  var label = this.model.statusLabel()
  return '<span class="label label-' + label + '">' + status + '</span>'
}

/**
 * Commuters
 */

View.prototype.commuterCount = function () {
  return this.model.commuters.length()
}

/**
 * Destroy
 */

View.prototype.destroy = function (e) {
  if (window.confirm('Delete organization?')) { // eslint-disable-line no-alert
    this.model.destroy(function (err) {
      if (err) {
        log.error('%e', err)
        window.alert(err) // eslint-disable-line no-alert
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        })
        page('/manager/organizations')
      }
    })
  }
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
    organization: this.model
  })
  document.body.appendChild(modal.el)
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
  var batch = new Batch()
  var spinner = spin()
  var modal = this
  var organization = modal.model.organization

  each(modal.findAll('tr'), function (el) {
    // if confirm is unchecked, skip
    if (!value(el.querySelector('.confirm'))) return

    // get the other data
    var data = {
      address: el.querySelector('.address').textContent || '',
      email: (el.querySelector('.email').textContent || '').toLowerCase(),
      name: el.querySelector('.name').textContent || ''
    }

    batch.push(function (done) {
      var commuter = new Commuter(data)
      commuter._user({
        email: data.email,
        type: 'commuter'
      })
      commuter._organization(organization._id())
      commuter.save(done)
    })
  })

  batch.end(function (err) {
    if (err) {
      log.error('%e', err)
      window.alert('Error while uploading commuters. ' + err) // eslint-disable-line no-alert
    } else {
      alerts.push({
        type: 'success',
        text: 'Upload succesful, commuters created & invited.'
      })
    }
    spinner.remove()
    modal.el.remove()
    page('/manager/organizations/' + organization._id() + '/show')
  })
}
