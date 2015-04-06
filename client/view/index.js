var reactive = require('reactive')
var view = require('view')

/**
 * Set up reactive plugins
 */

reactive.use(require('./active'))
reactive.use(require('./dropdown'))
reactive.use(require('./each'))
reactive.use(require('reactive-child'))
reactive.use(require('reactive-disabled'))
reactive.use(require('./messages'))
reactive.use(require('./tap'))

/**
 * Expose `view`
 */

module.exports = function (options, fn) {
  var View
  if (typeof options === 'string') {
    View = view(options, fn)
  } else {
    View = view(options.template, fn)
    View.prototype.category = options.category
    View.prototype.message = options.message
    View.prototype.title = options.title
  }

  return View
}
