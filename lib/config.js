/**
 * Env
 */

var env = process.env.NODE_ENV || 'development';

/**
 * Dependencies
 */

var config = require('../config.json');
var key = null;

/**
 * Override defaults with environment specific values
 */

for (key in config[env]) {
  config[key] = config[env][key];
}

for (key in process.env) {
  config[key] = process.env[key];
}

/**
 * Expose `config`
 */

module.exports = config;
