var config = require('config');
var mapModule = require('map');
var plugins = require('./leaflet_plugins');
var polyUtil = require('./polyline_encoded.js');
var routeboxer = require('./leaflet_routeboxer.js');


var center = config.geocode().center.split(',').map(parseFloat)
if (config.map_provider && config.map_provider() !== 'AmigoCloud') {
  L.mapbox.accessToken = config.mapbox_access_token();
}


module.exports = function(el) {
  var map, realtime, southWest, northEast, blurLayer;

  if (config.map_provider && config.map_provider() === 'AmigoCloud') {
    southWest = L.latLng(35.946877085397,-123.480610897013);
    northEast = L.latLng(40.763279543715,-118.789317362500);
    map = (new L.amigo.map(el, {
      amigoLogo: 'right',
      loadAmigoLayers: false,
      inertia: false,
      zoomAnimation: $('.hide-map').css('display') !== 'none',
      maxBounds: L.latLngBounds(southWest, northEast),
      minZoom: 8
    })).setView([center[1], center[0]], config.geocode().zoom);

    L.amigo.auth.setToken(config.support_data_token());

    blurLayer = L.tileLayer(
    'https://www.amigocloud.com/api/v1/users/'+
	'23/projects/3019/datasets/23835/tiles/{z}/{x}/{y}.png?' +
	'token=' + config.support_data_token(),
      {
        name: 'Uncovered Area'
      }
    );

    map.addAuthLayer({
      id: config.mapbox_map_id(),
      accessToken: config.mapbox_access_token(),
      name: 'Gray',
      provider: 'mapbox'
    });
    map.addBaseLayer(L.amigo.AmigoGray);
    map.layersControl.addBaseLayer(
      L.bingLayer(
        config.bing_key(),
	{
	  type: 'Road',
	  attribution: 'Bing Maps'
	}
      ),
      'Bing Road'
    );
    map.layersControl.addOverlay(blurLayer);
    blurLayer.addTo(map);

    module.exports.activeMap = map;

    map.realtimeControl = L.control.toggleRealTime().addTo(map);

    realtime = mapModule.realtime();
    console.log("entre amigo", map)

  } else {
    console.log("entre mapaboxs");
    map = L.mapbox.map(el, config.mapbox_map_id(), {
      attributionControl: false,
      inertia: false,
      zoomAnimation: false
    }).setView([center[1], center[0]], config.geocode().zoom);
  }

  return map;
};

module.exports.getMap = function () {
  return this.activeMap;
};


module.exports.cleanRoute = function() {
    module.exports.activeRoute.removeLayer();
    module.exports.activeRoute = null;
};


module.exports.marker_map = function(from, to, map){
    console.log("mapa from ->", from);
    console.log("mapa to ->", to);
     var IconStart = L.icon({
        iconUrl: 'assets/images/graphics/start.svg',
        iconSize: [40, 55],
        iconAnchor: [20, 50],
        popupAnchor:  [0, -50]
    });
    var IconEnd = L.icon({
        iconUrl: 'assets/images/graphics/end.svg',
        iconSize: [40, 55],
        iconAnchor: [20, 50],
        popupAnchor:  [0, -50]
    });

    //L.marker([37.35337508231001,-121.93626880645752], {icon: IconStart}).bindPopup('From').addTo(map);
    //L.marker([37.44377324953697,-122.16601610183714], {icon: IconEnd}).bindPopup('to').addTo(map);
    L.marker([from[0],from[1]], {icon: IconStart}).bindPopup('From').addTo(map);
    L.marker([to[0],to[1]], {icon: IconEnd}).bindPopup('to').addTo(map);

};

module.exports.polyline_creadas = [];

module.exports.getpolyline_creadas = function () {
  return this.polyline_creadas;
};

module.exports.drawRouteAmigo = function(route,mode) {
      var color = '#000';
      var weight = 5;
      var dasharray= '';
        console.log("imprime mode ->", mode);
        if (mode=="CAR") {
            color = '#FF0000';
            dasharray= '6';
            weight = 3;

        }else if(mode=="BICYCLE") {
            color = '#9E9E9E';
            dasharray= '6';
            weight = 3;

        }else if(mode=="SUBWAY" || mode=="RAIL") {
            color = '#FF0000';
             weight = 8;

        }
        else if(mode == "WALK") {
            color = '#0BC8F4';
            dasharray= '6';
             weight = 3;
        }


       var color_options = {
            color: color,
            opacity: 1,
            weight: weight,
            dashArray: dasharray
        };

      route = new L.Polyline(L.PolylineUtil.decode(route, 5), color_options);
      this.polyline_creadas.push(route);
        console.log("pintamos datos ->", this.polyline_creadas);
        //module.exports.polyline_creadas.push(route);
      var boxes = L.RouteBoxer.box(route, 5);
      var bounds = new L.LatLngBounds([]);
      var boxpolys = new Array(boxes.length);

      for (var i = 0; i < boxes.length; i++) {
        bounds.extend(boxes[i]);
      }
      route.addTo(this.activeMap);
      this.activeMap.fitBounds(bounds);
};

