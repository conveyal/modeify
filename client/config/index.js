var each = require('component-each')

var config = require('../../deployment/config.yaml')

var env = process.env.NODE_ENV

config.env = env
for (var key in config.environments[env])
  config[key] = config.environments[env][key] || config[key] || ''

delete config.environments

/**
 * Expose `getters` for config vars
 */

each(config, function (key, val) {
  module.exports[key] = module.exports[key.toLowerCase()] = function () {
    return val
  }
})
