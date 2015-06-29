# turf-point

[![build status](https://secure.travis-ci.org/Turfjs/turf-point.png)](http://travis-ci.org/Turfjs/turf-point)

turf point module


### `turf.point(longitude, latitude, properties)`

Generates a new Point feature, given coordinates
and, optionally, properties.


### Parameters

| parameter    | type   | description                                                   |
| ------------ | ------ | ------------------------------------------------------------- |
| `longitude`  | number | - position west to east in decimal degrees                    |
| `latitude`   | number | - position south to north in decimal degrees                  |
| `properties` | Object | - an optional object that is used as the Feature's properties |


### Example

```js
var pt1 = turf.point([-75.343, 39.984]);
//=pt1
```

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-point
```

## Tests

```sh
$ npm test
```

