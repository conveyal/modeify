var fmt = require('fmt')

var DEFAULT_MESSAGES = window.MESSAGES || {}

module.exports = messages

/**
 * Sprintf style client side message management that utilizes [yields/fmt](https://github.com/yields/fmt). Similar to [visionmedia/debug](https://github.com/visionmedia/debug), generates a function based on the passed in namespace.
 *
 * @param {String} namespace The namespace to use for the message function.
 * @param {Object} [messages=window.MESSAGES] The messages to use.
 * @returns {Function} message
 * @example
 * var messages = require('messages')('namespace')
 */

function messages (ns, msgs) {
  msgs = msgs || DEFAULT_MESSAGES
  ns = ns ? ns.split(':') : []

  /**
   * Pass in the path
   *
   * @param {String} path The path of the message corresponding it's place in the object hierarchy.
   * @param {...Mixed} data Values to be passed into `fmt` in order.
   * @returns {String} message
   * @example
   * var message = require('messages')('namespace')
   * console.log(message('path:to:message', 'Parameter 1', 4, 5.0))
   */

  function message (path) {
    if (!path) {
      throw new Error('Message requires a path.')
    }

    var fullPath = ns.concat(path.split(':'))
    var value = find(msgs, fullPath)
    if (arguments.length > 1) {
      value = fmt.apply(null, [value].concat([].slice.call(arguments)))
    }

    if (!value) {
      throw new Error('Message not found for ' + fullPath.join(':'))
    }

    return value
  }

  return message
}

function find (messages, path) {
  var value = messages[path.shift()]
  if (value && path.length > 0) {
    value = find(value, path)
  }
  return value
}
