var modal = require('./client/modal')
var session = require('session')


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

ShareModal.prototype.placeChanged = function (e) {
  var val = this.find('.place-select').value;
  var place = session.plan().get(val);
  this.find('.place-link').value = constructPlaceLink(place, val);
}

function constructPlaceLink(place, type) {
  var loc = window.location;
  return loc.protocol + "//" + loc.hostname + (loc.port ? ':' + loc.port: '') + '/?' + (type === 'from' ? 'planFrom' : 'planTo') + '=' + encodeURIComponent(place);
}