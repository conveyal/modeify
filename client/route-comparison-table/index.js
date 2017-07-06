var convert = require('../convert')
var view = require('../view')
var _tr = require('../translate')

var View = module.exports = view(require('./template.html'), function (view, model) {
  _tr.inHTML(view, 'p')
  _tr.inHTML(view, '.compare')
  _tr.inHTML(view, '.footnote')
  })

View.prototype.costSavings = function () {
  return convert.roundNumberToString(this.model.costSavings())
}

View.prototype.costPenalty = function () {
  return convert.roundNumberToString(this.model.costPenalty())
}
