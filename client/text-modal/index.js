var modal = require('./client/modal')

/**
 * Default Modal
 */

var Modal = modal({
  closable: true,
  template: require('./template.html')
})

/**
 * Expose `show`
 */

module.exports = function show (text) {
  var m = Modal({
    text: text
  })

  m.show()

  return m
}
