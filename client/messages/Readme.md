
### `messages(namespace, [messages=window.MESSAGES])`

A simple client side messaging module that utilizes [yields/fmt](https://github.com/yields/fmt). Similar to [visionmedia/debug](https://github.com/visionmedia/debug), generates a function based on the passed in namespace.


### Parameters

| parameter                    | type   | description                                    |
| ---------------------------- | ------ | ---------------------------------------------- |
| `namespace`                  | String | The namespace to use for the message function. |
| `[messages=window.MESSAGES]` | Object | _optional:_ The messages to use.               |


### Example

```js
var messages = require('messages')('namespace');
```


**Returns** `Function`, message


### `messages(path, data)`

Pass in the path


### Parameters

| parameter | type   | description                                                               |
| --------- | ------ | ------------------------------------------------------------------------- |
| `path`    | String | The path of the message corresponding it's place in the object hierarchy. |
| `data`    | Mixed  | Values to be passed into `fmt` in order.                                  |


### Example

```js
var messages = require('messages')('namespace');
console.log(messages('path:to:message', 'Parameter 1', 4, 5.0));
```


**Returns** `String`, message


