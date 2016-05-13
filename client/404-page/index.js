var fs = require('fs')
var view = require('../view')

/**
 * Expose `View`
 */

module.exports = view(fs.readFileSync(__dirname + '/template.html', 'utf8'))
