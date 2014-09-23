var each = require('each')
  , type = require('type')
  , bind = require('bind');


/**
 * Plugin.
 *
 * @param {Function|Object} models  The models to warm the cache with or the
 *                                  Model constructor for the plugin.
 */

module.exports = function (models) {
  // just the plugin
  if ('function' === type(models)) return new Memoizer(models);

  // warming cache with models
  return function (Model) {
    new Memoizer(Model, models);
  };
};


/**
 * Initialize a new `Memoizer`.
 *
 * @param {Model} Model   The Model constructor to memoize.
 * @param {Array} models  Optional array of models to warm the cache with.
 */

function Memoizer (Model, models) {
  this.Model = Model;
  this._get = bind(Model, Model.get);
  Model.get = bind(this, this.get);

  Model.on('construct', function (model) {
    cache[model.primary()] = model;
  });

  var cache = this.cache = {};
  if (models) each(models, function (attrs) {
    var model = new Model(attrs);
    cache[model.primary()] = model;
  });
}


/**
 * Check the cache before getting a model from the server.
 *
 * @param {String}   id        The primary key for the model.
 * @param {Function} callback  Called with `err, model`.
 */

Memoizer.prototype.get = function (id, callback) {
  var cache = this.cache;
  if (cache[id]) return callback(null, cache[id]);

  this._get(id, function (err, model) {
    if (err || !model) return callback(err);
    cache[model.primary()] = model;
    callback(null, model);
  });
};
