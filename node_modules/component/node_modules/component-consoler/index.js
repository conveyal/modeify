var debug = require('debug')('component-consoler');
var slice = Array.prototype.slice;

/**
 * Error types where we show the stack trace.
 * These are generally user errors, not "our" errors.
 **/
var showstack = [
  'ParseError',
  'SyntaxError',
  'URIError'
];

/**
 * Log message with `type` and `message` interpolated by `substitutes`.
 *
 * @param {String} type
 * @param {String} message
 * @param {...String} [substitutes]
 * @api public
**/
exports.log = function (type, message /*, substitutes */) {
  log('log', 36, type, message, slice.call(arguments, 2));
};

/**
 * Log warning message with `type` and `message` interpolated by `substitutes`.
 *
 * @param {String} type
 * @param {String} message
 * @param {...String} [substitutes]
 * @api public
**/
exports.warn = function (type, message /*, substitutes */) {
  log('warn', 33, type, message, slice.call(arguments, 2));
};

/**
 * Log error message with "error" type and `message` interpolated by `substitutes`.
 *
 * @param {String} message
 * @param {...String} [substitutes]
 * @api public
**/
exports.error = function (message /*, substitutes */) {
  log('error', 31, 'error', message, slice.call(arguments, 1));
};

/**
 * Log error message and exit with "fatal" type and `error` interpolated by `substitutes`.
 * Depending on the error type, show the stack trace.
 *
 * @param {String|Error} error
 * @param {...String} [substitutes]
 * @api public
**/
exports.fatal = function (error /*, substitutes */) {
  var message = error;

  if (error instanceof Error) {
    debug(error.stack);

    if (error.stack && ~showstack.indexOf(error.name)) {
      message = error.stack;
    } else {
      message = error.message;
    }
  }

  console.error();
  log('error', 31, 'fatal', message, slice.call(arguments, 1));
  console.error();
  process.exit(1);
};

/**
 * Log message in console `method` with `color`, `type`, `message`, `substitutes`.
 *
 * @param {String} method
 * @param {Number} color
 * @param {String} type
 * @param {String} message
 * @param {String[]} substitues
 * @api private
**/
function log (method, color, type, message, substitutes) {
  console[method].apply(console, [stylize(type, message, color)].concat(substitutes));
}

/**
 * Stylize message, use `color` for `type` before `message`.
 *
 * @param {String} type
 * @param {String} message
 * @param {Number} color
 * @return {String}
 * @api private
**/
function stylize (type, message, color) {
  return '  \033[' + color + 'm' + pad(type) + '\033[m : \033[90m' + message + '\033[m';
}

/**
 * Add whitespace indentation before text.
 *
 * @param {String} text
 * @return {String}
 * @api private
**/
function pad (text) {
  var width = 10;
  var length = Math.max(0, width - text.length);
  var space = Array(length + 1).join(' ');
  return space + text;
}
