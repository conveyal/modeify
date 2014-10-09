var View = require('view')(require('./template.html'));

module.exports = function(ctx, next) {
  ctx.view = new View();
  next();
};