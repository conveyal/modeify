var Analytics = require('analytics-node')
var config = require('./config')

/**
 * Expose logged in instance of Analytics
 */

var analytics = {}

;['alias', 'identify', 'page', 'track'].forEach(function (key) {
  analytics[key] = noop
})

if (config.segmentio_key && config.segmentio_key.length > 0) {
  analytics = new Analytics(config.segmentio_key)
}

module.exports = analytics

function noop () {}
