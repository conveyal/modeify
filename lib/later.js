
export default function later (fn) {
  process.nextTick(() => {
    try {
      fn()
    } catch (e) {
      console.error(e)
    }
  })
}
