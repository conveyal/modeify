const Analytics = require('analytics-node')

const config = require('./config')

let analytics = {}

;['alias', 'identify', 'page', 'track'].forEach((key) => {
  analytics[key] = noop
})

if (config.segmentio_key && config.segmentio_key.length > 0) {
  analytics = new Analytics(config.segmentio_key)
}

module.exports = analytics

function noop () {}
