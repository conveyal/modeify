const log = require('./log')

module.exports = function later (fn, delay) {
  if (delay) {
    return setTimeout(() => {
      later(fn)
    }, delay)
  }

  process.nextTick(() => {
    try {
      fn()
    } catch (e) {
      log.error(e)
    }
  })
}
