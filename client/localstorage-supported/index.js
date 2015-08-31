module.exports = function () {
  var testKey = 'test-localStorageSupported'
  try {
    var storage = window.localStorage
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}
