var fs = require('fs')
var convert = require('../convert')
var view = require('../view')

var View = module.exports = view(fs.readFileSync(__dirname + '/template.html', 'utf8'))

View.prototype.costSavings = function () {
  return convert.roundNumberToString(this.model.costSavings())
}

View.prototype.costPenalty = function () {
  return convert.roundNumberToString(this.model.costPenalty())
}
