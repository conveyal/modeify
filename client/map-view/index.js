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

module.exports.polyline_creadas = [];
module.exports.marker_creadas = [];

module.exports.getpolyline_creadas = function () {
  return this.polyline_creadas;
};

module.exports.getMarker_creadas = function () {
  return this.marker_creadas;
};

module.exports.cleanPolyline = function() {
    var polyline_creadas = this.getpolyline_creadas();
    var map = this.activeMap;
    for (i in polyline_creadas) {
        try {
                map.removeLayer(polyline_creadas[i]);
                console.log("elimina el mapa?");
            } catch (e) {
                console.log("problema al eliminar " + e);
            }

  }
  this.polyline_creadas = [];

};


module.exports.cleanMarker = function() {
    var map = this.activeMap;
    for (i in this.marker_creadas) {
        try {
                map.removeLayer(this.marker_creadas[i]);
                console.log("elimina el mapa?");
            } catch (e) {
                console.log("problema al eliminar " + e);
            }
    }

  this.marker_creadas = [];

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
    var markerform = new L.marker([from[0],from[1]], {icon: IconStart, draggable: true}).bindPopup('From').addTo(map);
    var markerto = new L.marker([to[0],to[1]], {icon: IconEnd, draggable: true}).bindPopup('to').addTo(map);
    var _this = this;
    markerform.on('dragend', function(e){
       var marker = e.target;
       var result = marker.getLatLng();
       console.log("cordenadas drag from ->",result);
       _this.cleanPolyline();
    });

    markerto.on('dragend', function(e){
        var marker = e.target;
        var result = marker.getLatLng();
        console.log("cordenadas drag to ->",result);
        _this.cleanPolyline();
    });

    this.marker_creadas.push(markerform);
    this.marker_creadas.push(markerto);
};



module.exports.marker_map_point = function(to, map){

    //console.log("mapa point to ->", to);
    var name = to[2];

//    var myIcon = L.divIcon({className: 'leaflet-div-icon'});
//// you can set .my-div-icon styles in CSS
//
//    L.marker([to[0], to[1]], {icon: myIcon}).addTo(map);

    var circle = L.circle([to[0], to[1]], 400, {
        color: '#000',
        weight: 2,
        fillColor: '#ffffff',
        fillOpacity: 1
    }).bindPopup(name).addTo(map);


    var myZoom = {
      start:  map.getZoom(),
      end: map.getZoom()
    };
    //console.log(myZoom);
    map.on('zoomstart', function(e) {
       myZoom.start = map.getZoom();
        //console.log("start zoom 400 ", myZoom.start);
    });

    map.on('zoomend', function(e) {
        myZoom.end = map.getZoom();
         //console.log("End zoom ", myZoom.end);
        var diff = myZoom.start - myZoom.end;
        if (diff > 0) {
            circle.setRadius(circle.getRadius() * 2);
        } else if (diff < 0) {
            circle.setRadius(circle.getRadius() / 2);
        }
    });



    //this.polyline_creadas.push(circle);
};



module.exports.drawRouteAmigo = function(route,mode) {
      var color = '#000';
      var weight = 5;
      var dasharray= '';

        if (mode=="CAR") {
            color = '#9E9E9E';
            dasharray= '6';
            weight = 3;

        }else if(mode=="BICYCLE") {
            color = '#FF0000';
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
        else if(mode=="BUS") {
            color = '#FEF0B5';
             weight = 8;
        }


       var color_options = {
            color: color,
            opacity: 1,
            weight: weight,
            dashArray: dasharray
        };

      route = new L.Polyline(L.PolylineUtil.decode(route, 5), color_options);
      this.polyline_creadas.push(route);
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

