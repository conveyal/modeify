var classes = require('classes')
var evnt = require('event')

/**
 * Expose `plugin`
 */

module.exports = function (reactive) {
  reactive.bind('dropdown', function (el, selector) {
    var parent = el.parentNode
    var list = classes(parent)
    var close = function (e) {
      list.remove('open')
      evnt.unbind(document, 'click', close)
      document.activeElement.blur()
    }

    evnt.bind(el, 'click', function (e) {
      e.stopPropagation()

      if (list.has('open')) {
        list.remove('open')
        evnt.unbind(document, 'click', close)
      } else {
        list.add('open')
        evnt.bind(document, 'click', close)
      }
    })
  })
}
