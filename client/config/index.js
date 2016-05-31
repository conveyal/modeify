var each = require('component-each')

var config = JSON.parse(process.env.SETTINGS)
config.env = process.env.NODE_ENV

each(config, function (key, val) {
  module.exports[key] = module.exports[key.toLowerCase()] = function () {
    return val
  }
})
