var view = require('../view')

var View = view(require('./template.html'), function (view, model) {
})

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}
