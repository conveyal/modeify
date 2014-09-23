var env = process.env.NODE_ENV || 'development';
var fs = require('fs');
var http = require('http');
var yml2json = require('js-yaml').load;

// Async config loading

module.exports = function(callback) {
  if (env === 'test' || env === 'development') {
    fs.readFile(__dirname + '/../config/config.yaml', 'utf8', function(err, data) {
      if (err) {
        callback(err);
      } else {
        callback(null, exposeConfig(data));
      }
    });
  } else {
    http.get(process.env.CONFIG_URL, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk.toString();
      });
      res.on('end', function() {
        callback(null, exposeConfig(data));
      });
    }).on('error', callback);
  }
};

/**
 * Expose config
 */

function exposeConfig(yaml) {
  var config = yml2json(yaml);
  var key = null;

  // Expose the configuration values

  for (key in config)
    module.exports[key] = config[key];

  // Override defaults with environment specific values

  for (key in config.environments[env])
    module.exports[key] = config.environments[env][key] || config[key] || '';

  // Delete environments

  delete config.environments;

  // Store environment variables in the config object

  for (key in process.env) {
    module.exports[key] = process.env[key];
    module.exports[key.toLowerCase()] = process.env[key];
  }

  return module.exports;
}
