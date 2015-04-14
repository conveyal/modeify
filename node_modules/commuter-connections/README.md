# commuter-connections

Find matches from CommuterConnections.org


### `URL`

Base URL for requests from Commuter Connections


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
  startLat: 39.0436,
  startLng: -77.4875,
  endLat: 38.9047,
  endLng: -77.0164,
  startRadius: 2,
  endRadius: 2
}).then((matches) => {
  console.log(matches) // # of matches found
}, handleError)
```


**Returns** `Promise`, promise


### `verifyFindMatchesOptions(opts)`

Verify find the options required for `findMatches`


### Parameters

| parameter | type   | description    |
| --------- | ------ | -------------- |
| `opts`    | Object | Options object |


### Example

```js
import {verifyFindMatchesOptions} from 'commuter-connections'
const errors = verifyFindMatchesOptions(opts)
if (errors.length > 0) handleErrors(errors)
```


**Returns** `Array`, errors Errors found in the options


### `createSoapClient`

Create a SOAP client to use with commuter connections.


### Example

```js
import {createSoapClient} from 'commuter-connections'
createSoapClient().then((client) => {
  // use the client
})
```


**Returns** `Promise`, promise

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install commuter-connections
```

## Tests

```sh
$ npm test
```


