var reactive = require('../../components/ianstormtaylor/reactive/0.13.2/lib')
var view = require('../../components/trevorgerhardt/view/0.4.1/lib')

/**
 * Set up reactive plugins
 */

reactive.use(require('./active'))
reactive.use(require('./dropdown'))
reactive.use(require('./each'))
reactive.use(require('../../components/segmentio/reactive-child/0.0.1'))
reactive.use(require('../../components/segmentio/reactive-disabled/0.0.1'))
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
