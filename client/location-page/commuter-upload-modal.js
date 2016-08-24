var view = require('../view')
var Alert = require('../alert')

/**
 * Modal, Input
 */

var Modal = module.exports = view(require('./commuter-upload-modal.html'))

var FieldOption = view(require('./field-option.html'))

Modal.prototype['fields-view'] = function () {
  return FieldOption
}

Modal.prototype['fields-auto-view'] = function () {
  return FieldOption
}

Modal.prototype.fields = function (includeAuto) {
  var fields = [{
    value: 'none',
    display: 'Not Included'
  }]

  if (includeAuto) {
    fields.push({
      value: 'auto',
      display: 'Auto-generated'
    })
  }

  for (var key in this.model.rawCommuterData[0]) {
    fields.push({
      value: 'table-' + key,
      display: 'Table field: ' + key
    })
  }

  return fields
}

Modal.prototype['fields-auto'] = function () {
  return this.fields(true)
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

Modal.prototype.continue = function (e) {
  e.preventDefault()
  var selections = {
    commuterId: this.find('.commuter-id-select').value,
    email: this.find('.email-select').value,
    givenName: this.find('.given-name-select').value,
    surname: this.find('.surname-select').value,
    address: this.find('.address-select').value
  }

  if (selections.commuterId === 'none' && selections.email === 'none') {
    this.find('.alerts').appendChild(Alert({
      type: 'warning',
      text: 'You must provide a source for either Commuter ID or Email Address.'
    }).el)
  } else {
    this.el.remove()

    var generatedId = 100000
    var commuterData = this.model.rawCommuterData.map(function (entry) {
      var processedEntry = {}

      if (selections.commuterId === 'auto') {
        processedEntry.internalId = ++generatedId
      } else if (selections.commuterId !== 'none') {
        processedEntry.internalId = entry[selections.commuterId.substring(6)]
      }

      if (selections.email !== 'none') {
        processedEntry.email = entry[selections.email.substring(6)]
      }

      if (selections.givenName !== 'none') {
        processedEntry.givenName = entry[selections.givenName.substring(6)]
      }

      if (selections.surname !== 'none') {
        processedEntry.surname = entry[selections.surname.substring(6)]
      }

      if (selections.address !== 'none') {
        processedEntry.address = entry[selections.address.substring(6)]
      }

      return processedEntry
    })
    this.options.onContinue(commuterData)
  }
}
