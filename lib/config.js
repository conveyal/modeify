var fs = require('fs')
var yml2json = require('js-yaml').load

var env = process.env.NODE_ENV || 'development'
var config = {}
var path = env === 'test' ? 'config/config.yaml.tmp' : 'deployment/config.yaml'
var yaml = yml2json(fs.readFileSync(__dirname + '/../' + path, 'utf8'))

var key = null

for (key in yaml)
  config[key] = yaml[key]

  // Override defaults with environment specific values

for (key in yaml.environments[env])
  config[key] = yaml.environments[env][key] || yaml[key] || ''

  // Delete environments

delete config.environments

// Store environment variables in the config object

for (key in process.env) {
  config[key] = process.env[key]
  config[key.toLowerCase()] = process.env[key]
}

// Expose the configuration values

module.exports = config
