var view = require('view')

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}

var View = view(require('./template.html'))
