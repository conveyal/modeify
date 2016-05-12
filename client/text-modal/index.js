var fs = require('fs')
var modal = require('../modal')

require('./style.css')

/**
 * Default Modal
 */

var Modal = modal({
  closable: true,
  template: fs.readFileSync(__dirname + '/template.html')
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
