var alerts = require('../alerts')
var CommuterLocation = require('../commuter-location')
var each = require('component-each')
var log = require('../log')('location-page:modal')
var value = require('component-value')
var view = require('../view')

/**
 * Modal, Input
 */

var Input = view(require('./commuter-confirm-input.html'))
var Modal = module.exports = view(require('./commuter-confirm-modal.html'))

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
  var location = this.model.location

  var commuters = []
  each(modal.findAll('tr'), function (el) {
    if (!el.querySelector('.confirm')) return
    // if confirm is unchecked, skip
    console.log(value(el.querySelector('.confirm')))
    if (!value(el.querySelector('.confirm'))) return

    // get the other data
    commuters.push({
      address: el.querySelector('.address').textContent || '',
      email: el.querySelector('.email').textContent ? el.querySelector('.email').textContent.toLowerCase() : null,
      internalId: el.querySelector('.internalId').textContent || null,
      givenName: el.querySelector('.givenName').textContent || '',
      surname: el.querySelector('.surname').textContent || ''
    })
  })

  CommuterLocation.addCommuters(location._id(), this.model.organization._id(), commuters, function (err, res) {
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
