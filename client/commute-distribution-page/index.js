var view = require('../view')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}
