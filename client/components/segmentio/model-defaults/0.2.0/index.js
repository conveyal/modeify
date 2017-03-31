var clone = require('component-clone');
var each = require('component-each');
var type = require('component-type');
var is = require('is');

/**
 * Plugin.
 *
 * @param {Function|Object} values  The default values dictionary or the Model.
 */

module.exports = function (values) {
  if ('object' === type(values)) {
    return function (Model) {
      bind(Model, values);
    };
  } else {
    return bind(values);
  }
};


/**
 * Bind to the model's construct event.
 *
 * @param {Function} Model  The model constructor.
 */

function bind (Model, defaults) {
  defaults || (defaults = {});
  Model.on('construct', function (model, attrs) {
    each(Model.attrs, function (key, options) {
      var value = undefined != options.default
        ? options.default
        : defaults[key];

      if (value !== undefined) apply(model, key, value);
    });
  });
}


/**
 * Default a `model` with a `value` for a `key` if it doesn't exist. Use a clone
 * of the value if it is not passed from a function, so that it's
 * easy to declare objects and arrays without worrying about copying by reference.
 *
 * @param {Model}          model  The model.
 * @param {String}         key    The key to back by a default.
 * @param {Mixed|Function} value  The default value to use.
 */

function apply (model, key, value) {
  if(model[key]() !== undefined) return;
  value = is.function(value) ? value.call(model) : clone(value);
  model.attrs[key] = value;
}
