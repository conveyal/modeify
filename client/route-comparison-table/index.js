var convert = require('../convert')
var view = require('../view')

var View = module.exports = view(require('./template.html'))

View.prototype.costSavings = function () {
  return convert.roundNumberToString(this.model.costSavings())
}

View.prototype.costPenalty = function () {
  return convert.roundNumberToString(this.model.costPenalty())
}
