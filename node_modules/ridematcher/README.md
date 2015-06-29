# ridematcher

[![build status](https://secure.travis-ci.org/conveyal/ridematcher.js.png)](http://travis-ci.org/conveyal/ridematcher.js)

Find carpool/vanpool matches within a commuter population


### `findMatches(opts)`

Make a SOAP request to [Commuter Connections](http://www.commuterconnections.org/) to get the number of carpools available for a given starting, ending location, and search radius.

### Parameters

| parameter | type   | description    |
| --------- | ------ | -------------- |
| `opts`    | Object | Options object |


### Example

```js
import {findMatches} from 'commuter-connections'
findMatches({
  commuters: [{
    _id: 1,
    coordinates: [-77.4875, 39.0436]
  }], {
    radius: .5,
    units: 'miles'
}}).then((matches) => {
    console.log(matches) // map of commuter id's to matching commuter id's
}, handleError)
```


**Returns** `Promise`, promise

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install ridematcher
```

## Tests

```sh
$ npm test
```


