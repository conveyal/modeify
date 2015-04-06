/**
 * Bind event
 */

var evnt = require('event')

/**
 * Expose `plugin`
 */

module.exports = function (reactive) {
  reactive.bind('data-active', function (el, name) {
    var view = this.reactive.view

    evnt.bind(el, 'click', function (e) {
      e.preventDefault()

      var el = e.target
      var val = el.getAttribute('data-active')

      while (el && (val === undefined || val === null)) {
        el = el.parentNode
        val = el && el.getAttribute('data-active')
      }

      // toggle the value
      var newVal = !el.classList.contains('active')
      if (view[val]) {
        view[val](newVal)
      } else {
        view.model[val](newVal)
      }

      // emit active on
      view.emit('active', name, newVal)

      document.activeElement.blur()
    })

    this.change(function () {
      var val = this.value(name)

      if (val) el.classList.add('active')
      else el.classList.remove('active')
    })
  })
}
