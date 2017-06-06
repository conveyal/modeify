var config = require('../config')
var L = require('leaflet')
var debounce = require('debounce')
var session = require('../session')

var center = config.geocode().center.split(',').map(parseFloat)

var placeChanged = debounce(function (name, coordinate) {
  var plan = session.plan()
  plan.setAddress(name, coordinate.lng + ',' + coordinate.lat, function (err, rees) {
    if (err) console.error(err)
    else plan.updateRoutes()
  })
}, 150, true)

function constructMapboxUrl (tileset) {
  //TL Stop using Mapbox, stamen is a first replacement 24/05/2017
  return 'http://tile.stamen.com/terrain/{z}/{x}/{y}.png';
}

module.exports = function (el) {
  try {
    // create the map
    var map = L.map(el, {
      attributionControl: {
        compact: true,
        position: 'bottomleft'
      },
      inertia: false,
      zoomAnimation: false
    }).setView([center[1], center[0]], config.geocode().zoom)

    // add the base layer tileset
    L.tileLayer(constructMapboxUrl(config.mapbox_base_style())).addTo(map)

    // add a custom pane for the layers
	//TL 06/06/2017 Appears above itinerary
    /*map.createPane('labels')

    // this pane is above overlays but below popups
    map.getPane('labels').style.zIndex = 650

    // layers in this pane are non-interactive and do not obscure mouse/touch events
    map.getPane('labels').style.pointerEvents = 'none'

    // add the labels layer to the labels pane
    L.tileLayer(constructMapboxUrl(config.mapbox_label_style()), { pane: 'labels' }).addTo(map)*/
  } catch (err) {
    console.log(err)
  }

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
