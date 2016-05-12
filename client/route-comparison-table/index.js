var fs = require('fs')
var convert = require('../convert')
var view = require('../view')

require('./style.css')

var View = module.exports = view(fs.readFileSync(__dirname + '/template.html'))

View.prototype.costSavings = function () {
  return convert.roundNumberToString(this.model.costSavings())
}

View.prototype.costPenalty = function () {
  return convert.roundNumberToString(this.model.costPenalty())
}
