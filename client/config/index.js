var each = require('component-each')

var config = JSON.parse(process.env.SETTINGS)
config.env = process.env.NODE_ENV

window.MODEIFY_CONFIG = {}

each(config, function (key, val) {
  module.exports[key] = window.MODEIFY_CONFIG[key] = function () {
    return val
  }
})
