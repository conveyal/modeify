var fs = require('fs')
var create = require('../view')

/**
 * Expose `Alert`
 */

var Alert = module.exports = create(fs.readFileSync(__dirname + '/template.html', 'utf8'))

/**
 * Dispose
 */

Alert.prototype.dispose = function (e) {
  e.preventDefault()
  this.off()
  this.el.remove()
}
