var fs = require('fs');
var yml2json = require('js-yaml').load;

var config = yml2json(fs.readFileSync(__dirname + '/../config/public.yaml', 'utf8'));
var env = process.env.NODE_ENV || 'development';
var key = null;

// Override defaults with environment specific values

for (key in config.environments[env])
  config[key] = config.environments[env][key];

// Delete environments

delete config.environments;

// Store environment variables in the config object

for (key in process.env) {
  config[key] = process.env[key];
  config[key.toLowerCase()] = process.env[key];
}

/**
 * Expose `config`
 */

module.exports = config;
