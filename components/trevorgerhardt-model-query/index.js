var Collection = require('collection');
var once = require('once');

/**
 *  Plugin.
 */

module.exports = function(Model) {
  /**
   * Create `get` request
   */

  function get() {
    var req = Model.request
      .get(Model.url(''))
      .set(Model._headers);

    var end = req.end;
    req.end = function(fn) {
      // Call only once
      fn = once(fn);

      end.call(req, function(err, res) {
        if (err || !res.ok) {
          fn(err || new Error(res.text), null, res);
        } else {
          var col = new Collection();
          for (var i = 0, len = res.body.length; i < len; ++i) {
            col.push(new Model(res.body[i]));
          }
          fn(null, col, res);
        }
      });
    };

    var query = req.query;
    req.query = function(params, fn) {
      query.call(req, params);
      if (fn) return req.end(fn);
      return req;
    };

    req.limit = function(limit, fn) {
      return req.query({ limit: limit }, fn);
    };

    req.skip = function(skip, fn) {
      return req.query({ skip: skip }, fn);
    };

    return req;
  }

  /**
   *
   */

  Model.req = function(fn) {
    if (fn) return get().end(fn);
    else return get();
  };

  /**
   * Take a `query` and invoke `fn(err, collection, response)`
   *
   * @param {Object} query
   * @param {Function} callback
   */

  Model.query = function(query, fn) {
    return get().query(query, fn);
  };

  /**
   * Limi
   */

  Model.limit = function(limit, fn) {
    return get().limit(limit, fn);
  };

  /**
   * Skip
   */

  Model.skip = function(skip, fn) {
    return get().skip(skip, fn);
  };
};