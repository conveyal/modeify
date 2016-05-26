var create = require('../view')

/**
 * Expose `Alert`
 */

var Alert = module.exports = create(require('./template.html'))

/**
 * Dispose
 */

Alert.prototype.dispose = function (e) {
  e.preventDefault()
  this.off()
  this.el.remove()
}
