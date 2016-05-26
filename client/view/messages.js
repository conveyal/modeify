var messages = require('../messages')

module.exports = function (reactive) {
  reactive.bind('data-message', function (el, name) {
    var message = this.view.message || messages()
    this.change(function () {
      el.innerHTML = message(name)
    })
  })
}
