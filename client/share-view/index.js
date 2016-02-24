var modal = require('./client/modal')
var session = require('session')
var request = require('request')
var Alert = require('alert')

/**
 * Expose `Modal`
 */

var ShareModal = module.exports = modal({
  closable: true,
  width: '768px',
  template: require('./template.html')
}, function (view, routes) {

  view.find('.trip-link').value = window.location.href;
  view.find('.place-link').value = constructPlaceLink(session.plan().from(), 'from');

  var tripClipboard = new Clipboard('#copy-trip-btn');
  tripClipboard.on('success', function(e) {
      e.clearSelection();
  });

  var placeClipboard = new Clipboard('#copy-place-btn');
  placeClipboard.on('success', function(e) {
      e.clearSelection();
  });
})

ShareModal.prototype.sendEmail = function () {
  var self = this

  request.post('/share/share-trip', {
    from: this.find('.from-email').value,
    to: this.find('.to-email').value,
    subject: this.find('.email-subject').value,
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
  var val = this.find('.place-select').value;
  var place = session.plan().get(val);
  this.find('.place-link').value = constructPlaceLink(place, val);
}

function constructPlaceLink(place, type) {
  var loc = window.location;
  return loc.protocol + "//" + loc.hostname + (loc.port ? ':' + loc.port: '') + '/?' + (type === 'from' ? 'planFrom' : 'planTo') + '=' + encodeURIComponent(place);
}

