var each = require('component-each')

var config = JSON.parse(process.env.SETTINGS)

var env = process.env.NODE_ENV

config.env = env
for (var key in config.environments[env]) {
  config[key] = config.environments[env][key] || config[key] || ''
}

each(config, function (key, val) {
  module.exports[key] = module.exports[key.toLowerCase()] = function () {
    return val
  }
})
