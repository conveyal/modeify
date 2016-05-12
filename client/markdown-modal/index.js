var fs = require('fs')
var modal = require('../modal')

require('./style.css')

module.exports = modal({
  closable: true,
  width: '640px',
  template: fs.readFileSync(__dirname + '/template.html')
})
