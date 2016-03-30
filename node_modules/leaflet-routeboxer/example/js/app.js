/**
 *  Example app to show leaflet-routerbox
 *
 *
 **/
function App() {

  this.route =  [];
  this.map = L.map('map').setView([50.8453995, 10.556859500000003],6);
  this.bounds = {};
  this.distance = 10; // Distance in km

  // Load the tiles CartoDB Retina
  /*var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>, OSRM instance by <a href="//mapzen.com">Mapzen</a>'
  }).addTo(this.map);/*/

  var layer = L.tileLayer('http://osm.nearest.place/retina/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles &copy; <a href="http://www.distance.to">Distance.to</a>'
  }).addTo(this.map);

  // Waypoints for getting a route of
  var loc = [
    '53.553406,9.992196',
    '48.139126,11.580186'
  ];

  this.route = this.loadRoute(loc, this.drawRoute);

}

/**
 *  Format an array of LatLng for L.polyline from uncompressed OSRM request
 *
 */
App.prototype.formArray = function (arr) {
  var narr = [];
  for(var x=0;x<arr.length;x++){
    var _n = arr[x].split(',');
    narr.push([ parseFloat(_n[0]), parseFloat(_n[1])]);
  }
  return narr;
};

/**
 *  Draw the route as a polyline
 *
 **/
App.prototype.drawRoute = function (route) {

  route = new L.Polyline(L.PolylineUtil.decode(route, 6)); // OSRM polyline decoding

  var boxes = L.RouteBoxer.box(route, this.distance);
  var bounds = new L.LatLngBounds([]);
  var boxpolys = new Array(boxes.length);

  for (var i = 0; i < boxes.length; i++) {
    L.rectangle(boxes[i], {color: "#ff7800", weight: 1}).addTo(this.map);
    bounds.extend(boxes[i]);
  }

  route.addTo(this.map);
  this.map.fitBounds(bounds);

  return route;

};

/**
 *  Load route from Mapzen OSRM server
 *
 *  compressin must be switched off
 *
 **/
App.prototype.loadRoute = function (loc) {
  var url = 'http://router.project-osrm.org/viaroute?';
  var _this = this;

  for(var i=0; i<loc.length;i++) {
    url = url + '&loc=' + loc[i];
  }

  var jqxhr = $.ajax({
    url: url,
    data: {
      instructions: false,
      //compression: false,
      alt: false
    },
    dataType: 'json'
  })
  .done(function(data) {
    _this.drawRoute(data.route_geometry);
  })
  .fail(function(data) {
    console.log(data);
  });

};
