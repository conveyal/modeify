var View = require('view')({
  category: 'style-guide',
  template: require('./template.html'),
  title: 'Style Guide'
});

module.exports = function(ctx, next) {
  ctx.view = new View();
  next();
};
