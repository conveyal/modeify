# Leaflet RouteBoxer

This is a Leaflet implementation of the [RouteBoxer](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/routeboxer/docs/examples.html) Class from Google.

The RouteBoxer class generates a set of L.LatLngBounds objects that are guaranteed
to cover every point within a specified distance of a path, such as that generated
for a route by an OSRM directions service.

## Example

Check out the example [demo](http://stephangeorg.github.io/leaflet-routeboxer/example/)

## Install

```
bower install leaflet-routeboxer
```

## Usage

You need to pass an array of L.Latlng objects (route) to the L.RouteBoxer.


```javascript

var route = [
  [50.5, 30.5],
  [50.4, 30.6],
  [50.3, 30.7]
];
var boxes = L.RouteBoxer.box(route, distance);

```

### Using OSRM service

OSRM uses polyline encoding to save bandwith. To decode the polyline you can use
[Leaflet.encoded](https://github.com/jieter/Leaflet.encoded).

```javascript

// data.route_geometry is the result from a OSRM endpoint
var route = new L.Polyline(L.PolylineUtil.decode(data.route_geometry, 6));
var boxes = L.RouteBoxer.box(route, distance);

```

Here is a complete example

```javascript

/**
 * Callback function to draw polyline and calculate bounds
 *
 */
function drawRoute(data){

  // OSRM polyline decoding w/ https://github.com/jieter/Leaflet.encoded
  var route = new L.Polyline(L.PolylineUtil.decode(data.route_geometry, 6));
  var distance = 10 // distance in km from route

  // You need to pass an array of L.LatLng objects to the RouteBoxer
  var boxes = L.RouteBoxer.box(route, distance);
  var boxpolys = new Array(boxes.length);

  for (var i = 0; i < boxes.length; i++) {

    // Perform search over this bounds
    L.rectangle(boxes[i], {color: "#ff7800", weight: 1}).addTo(this.map); // draw rectangles based on Bounds

  }
  route.addTo(this.map); // draw original route
}

// Waypoints for the route
var loc = [
  '53.553406,9.992196',
  '48.139126,11.580186'
];

// Use endpoint only for testing
var url = 'http://router.project-osrm.org/viaroute?';

// Add all waypoints
for(var i=0; i<loc.length;i++) {
  url = url + '&loc=' + loc[i];
}

// Get route from OSRM
var jqxhr = $.ajax({
  url: url,
  data: {
    instructions: false,
    alt: false
  },
  dataType: 'json'
})
.done(function(data) {
  drawRoute(data);
});

```
