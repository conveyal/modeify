# turf-destination

[![build status](https://secure.travis-ci.org/Turfjs/turf-destination.png)](http://travis-ci.org/Turfjs/turf-destination)

turf destination module


### `turf.destination(start, distance, bearing, units)`

Takes a Point feature and calculates the location of a destination point given a distance in degrees, radians, miles, or kilometers; and bearing in degrees. This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.


### Parameters

| parameter  | type   | description                            |
| ---------- | ------ | -------------------------------------- |
| `start`    | Point  | a Point feature at the starting point  |
| `distance` | Number | distance from the starting point       |
| `bearing`  | Number | ranging from -180 to 180               |
| `units`    | String | miles, kilometers, degrees, or radians |


### Example

```js
var point1 = turf.point([-75.343, 39.984]);
var distance = 50;
var bearing = 90;
var units = 'miles';

var destination = turf.destination(point1, distance, bearing, units);
point1.properties['marker-color'] = '#0f0';
destination.properties['marker-color'] = '#f00';

var result = turf.featurecollection([point1, destination]);

//=result
```


**Returns** `Point`, a Point feature at the destination

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-destination
```

## Tests

```sh
$ npm test
```

