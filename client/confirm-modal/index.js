var modal = require('../modal')

/**
 * Create `Modal`
 */

var Modal = modal({
  closable: true,
  template: require('./template.html')
})

/**
 * Confirm
 */

Modal.prototype.confirm = function (e) {
  e.preventDefault()
  if (this.model.confirmCallback) {
    this.model.confirmCallback.apply(this, e)
  }
  this.hide()
}

/* Modal.prototype.showCancel = function (e) {
  return false
} */

/**
 * Expose `confirm`
 */

module.exports = function (opts, callback) {
  var m = Modal({
    confirmCallback: callback,
    confirmText: opts.confirmText || 'Ok',
    text: opts.text,
    showCancel: opts.showCancel !== undefined ? opts.showCancel : true
  })

  m.show()

  return m
}
