var config = require('./client/config')
var tableize = require('tableize')

module.exports.identify = function (id, data) {
  if (config.segmentio_key() && window.analytics) {
    window.analytics.identify(id, tableize(data || {}))
  }
}

module.exports.page = function (name, category) {
  if (config.segmentio_key() && window.analytics) {
    window.analytics.page(name, category)
  }
}

module.exports.track = function (name, data) {
  if (config.segmentio_key() && window.analytics) {
    window.analytics.track(name, tableize(data || {}))
  }
}
