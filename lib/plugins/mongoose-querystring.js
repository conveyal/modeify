/**
 * Dependencies
 */

var extend = require('util')._extend
var monquery = require('monquery')

/**
 * Expose `plugin`
 */

module.exports = function (schema, options) {
  /**
   * Takes an express parsed query object
   */

  schema.statics.querystring = function (qs) {
    var find = qs.$query ? monquery(qs.$query) : {}

    var query = this.find(find)
      .limit(qs.limit)
      .skip(qs.skip || 0)

    var obj = extend({}, qs)

    delete obj.$query
    delete obj.limit
    delete obj.skip

    for (var key in obj) {
      query.where(key, obj[key])
    }

    return query
  }
}
