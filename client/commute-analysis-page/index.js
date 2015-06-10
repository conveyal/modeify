var log = require('log')('commute-analysis-page')
var view = require('view')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View()
  next()
}
