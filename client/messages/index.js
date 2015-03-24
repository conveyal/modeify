var fmt = require('fmt');

var Messages = {};

module.exports = message;
module.exports.set = set;

set(window.MESSAGES);

/**
 * A simple client side messaging module that utilizes [yields/fmt](https://github.com/yields/fmt).
 *
 * @module messages
 * @param {String} path The `.` path of the message corresponding it's place in the object hierarchy.
 * @param {...Mixed} data Values to be passed into `fmt` in order.
 * @returns {String} message
 * @example
 * var messages = require('messages')
 * console.log(messages('path.to.message', 'Parameter 1', 4, 5.0));
 */

function message(path) {
  var value = find(Messages, path.split('.'));
  if (arguments.length > 1) {
    value = fmt.apply(null, [value].concat([].slice.call(arguments)));
  }
  return value;
}

function find(messages, path) {
  if (path.length > 1) {
    return find(messages[path.shift()], path);
  } else {
    return messages[path.shift()];
  }
}

/**
 * Set the `messages` object. Defaults to `window.MESSAGES`.
 *
 * @module messages
 * @param {Object} messages object you want to set it to
 * @example
 * var messages = require('messages');
 * messages.set({ test: 'Test message %d' });
 * console.log(messages('test', '1'));
 */

function set(messages) {
  Messages = messages;
}
