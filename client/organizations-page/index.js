var log = require('../log')('organizations-page')
var view = require('../view')

var Row = require('./row')
var template = require('./template.html')

/**
 * Create `View`
 */

var View = view(template)

/**
 * Expose `render` middleware
 */

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View({
    organizations: ctx.organizations
  })

  next()
}

/**
 * Orgs view
 */

View.prototype['organizations-view'] = function () {
  return Row
}
