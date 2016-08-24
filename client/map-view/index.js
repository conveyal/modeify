var config = require('../config')
var L = require('mapbox.js')
var debounce = require('debounce')
var session = require('../session')

var center = config.geocode().center.split(',').map(parseFloat)

L.mapbox.accessToken = config.mapbox_access_token()

var placeChanged = debounce(function (name, coordinate) {
  var plan = session.plan()
  plan.setAddress(name, coordinate.lng + ',' + coordinate.lat, function (err, rees) {
    if (err) console.error(err)
    else plan.updateRoutes()
  })
}, 150, true)

module.exports = function (el) {
  var map = L.mapbox.map(el, config.mapbox_map_id(), {
    attributionControl: {
      compact: true,
      position: 'bottomleft'
    },
    inertia: false,
    zoomAnimation: false
  }).setView([center[1], center[0]], config.geocode().zoom)

  map.doubleClickZoom.disable()
  map.on('dblclick', function (e) {
    var popupContent = document.createElement('div')
    popupContent.setAttribute('data-lat', e.latlng.lat)
    popupContent.setAttribute('data-lng', e.latlng.lng)

    popupContent.innerHTML = 'Set as: <span class="set-start"><span class="add-on icon-start"></span> Start</span> | <span class="set-end"><span class="icon-end"></span> End</span>'
    popupContent.getElementsByClassName('set-start')[0].onclick = function (e) {
      placeChanged('from', {
        lat: parseFloat(e.target.parentElement.dataset['lat']),
        lng: parseFloat(e.target.parentElement.dataset['lng'])
      })
      map.closePopup()
    }

    popupContent.getElementsByClassName('set-end')[0].onclick = function (e) {
      placeChanged('to', {
        lat: parseFloat(e.target.parentElement.dataset['lat']),
        lng: parseFloat(e.target.parentElement.dataset['lng'])
      })
      map.closePopup()
    }

    L.popup()
      .setLatLng(e.latlng)
      .setContent(popupContent)
      .openOn(map)
  })

  return map
}
