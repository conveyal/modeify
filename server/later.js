/**
 * Later
 */

module.exports = function(fn, cb) {
  if (cb) return fn(cb);

  try {
    setImmediate(function() {
      fn(err);
    });
  } catch (e) {
    err(e);
  }
};

/**
 * Log error
 */

function err(e) {
  if (e) console.error(e);
}
