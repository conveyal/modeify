import log from './log'

export default function later (fn) {
  process.nextTick(() => {
    try {
      fn()
    } catch (e) {
      log.error(e)
    }
  })
}
