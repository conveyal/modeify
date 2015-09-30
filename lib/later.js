import log from './log'

export default function later (fn, delay) {
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
