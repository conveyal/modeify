# ridematcher

[![build status](https://secure.travis-ci.org/conveyal/ridematcher.js.png)](http://travis-ci.org/conveyal/ridematcher.js)

Find carpool/vanpool matches within a commuter population


### `findMatches(commuters, opts)`

Make a SOAP request to [Commuter Connections](http://www.commuterconnections.org/) to get the number of carpools available for a given starting, ending location, and search radius.

### Parameters

| parameter   | type   | description                               |
| ----------- | ------ | ----------------------------------------- |
| `commuters` | Array  | Array of commuters to match to each other |
| `opts`      | Object | Options object                            |


### Example

```js
import {findMatches} from 'commuter-connections'
findMatches({
  commuters: [{
    _id: 1,
    from: [-77.4875, 39.0436],
    to: [..]
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


