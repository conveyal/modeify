
var domify = require('domify');
var protos = require('./protos');
var reactive = require('reactive');
var statics = require('./statics');
var type = require('type');


/**
 * Expose `createView`.
 */

module.exports = createView;


/**
 * Create a new view constructor with the given `template`.
 * Optional `fn` will be assigned to `construct` events.
 *
 * @param {String or Function} template
 * @param {Function} [fn]
 * @return {Function}
 */

function createView (template, fn) {
  if (!template) throw new Error('template required');

  /**
   * Initialize a new `View` with an optional `model`, `el` and `options`.
   *
   * @param {Object} model (optional)
   * @param {Element} el (optional)
   * @param {Object} options (optional)
   */

  function View (model, el, options) {
    options = options || {};
    if ('object' == type(el)) options = el, el = null;
    if ('element' == type(model)) options = el, el = model, model = null;

    this.model = model || {};
    this.el = el || domify(
      'function' == type(this.template)
        ? this.template(this.model)
        : this.template
      );
    this.options = options;
    this.reactive = reactive(this.el, this.model, this);
    this.View.emit('construct', this, this.model, this.el, this.options);
  }

  View.prototype.template = template;
  View.prototype.View = View;
  for (var key in statics) View[key] = statics[key];
  for (var key in protos) View.prototype[key] = protos[key];

  // assign optional `construct` listener
  if (fn) View.on('construct', fn);

  return View;
}