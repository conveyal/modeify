var fmt = require('fmt');

var DEFAULT_MESSAGES = window.MESSAGES;

/**
 * A simple client side messaging module that utilizes [yields/fmt](https://github.com/yields/fmt). Similar to [visionmedia/debug](https://github.com/visionmedia/debug), generates a function based on the passed in namespace.
 *
 * @module messages
 * @param {String} namespace The namespace to use for the message function.
 * @param {Object} [messages=window.MESSAGES] The messages to use.
 * @returns {Function} message
 * @example
 * var messages = require('messages')('namespace');
 */

module.exports = function messages(ns, msgs) {
  msgs = msgs || DEFAULT_MESSAGES;
  ns = ns.split(':');

  /**
   * Pass in the path
   *
   * @module message
   * @param {String} path The path of the message corresponding it's place in the object hierarchy.
   * @param {...Mixed} data Values to be passed into `fmt` in order.
   * @returns {String} message
   * @example
   * var message = require('messages')('namespace');
   * console.log(message('path:to:message', 'Parameter 1', 4, 5.0));
   */

  function message(path) {
    var value = find(msgs, ns.concat(path.split(':')));
    if (arguments.length > 1) {
      value = fmt.apply(null, [value].concat([].slice.call(arguments)));
    }
    return value;
  }

  return message;
};

function find(messages, path) {
  if (path.length > 1) {
    return find(messages[path.shift()], path);
  } else {
    return messages[path.shift()];
  }
}
