var modal = require('../modal')
var session = require('../session')
var request = require('../request')
var Alert = require('../alert')

/**
 * Expose `Modal`
 */

var ShareModal = module.exports = modal({
  closable: true,
  width: '768px',
  template: require('./template.html')
}, function (view, routes) {
  view.find('.trip-link').value = window.location.href
  view.find('.place-link').value = constructPlaceLink(session.plan().from(), 'from')

  var tripClipboard = new window.Clipboard('#copy-trip-btn')
  tripClipboard.on('success', function (e) {
    e.clearSelection()
  })

  var placeClipboard = new window.Clipboard('#copy-place-btn')
  placeClipboard.on('success', function (e) {
    e.clearSelection()
  })
})

ShareModal.prototype.sendEmail = function () {
  var self = this

  var fromName = this.find('.from-name').value
  if (!fromName || fromName === '') {
    self.find('.alerts').appendChild(Alert({
      type: 'warning',
      text: 'You must provide your name.'
    }).el)
    return
  }

  var toEmail = this.find('.to-email').value
  if (!toEmail || toEmail === '') {
    self.find('.alerts').appendChild(Alert({
      type: 'warning',
      text: 'You must provide the recipient email address.'
    }).el)
    return
  }

  request.post('/share/share-trip', {
    fromName: fromName,
    to: toEmail,
    body: this.find('.email-body').value,
    link: window.location.href
  }, function (
    err, res) {
    if (err || !res.ok) {
      console.error('error sharing trip', err)
    } else {
      console.log('shared!, showing alert')
      self.find('.alerts').appendChild(Alert({
        type: 'success',
        text: 'Your trip has been sent to ' + self.find('.to-email').value + '!'
      }).el)
    }
  })
}

ShareModal.prototype.placeChanged = function (e) {
  var val = this.find('.place-select').value
  var place = session.plan().get(val)
  this.find('.place-link').value = constructPlaceLink(place, val)
}

ShareModal.prototype.fromName = function (e) {
  return session.user() ? (session.user().fullName() || session.user().email()) : null
}

function constructPlaceLink (place, type) {
  var loc = window.location
  return loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') + '/?' + (type === 'from' ? 'planFrom' : 'planTo') + '=' + encodeURIComponent(place)
}
