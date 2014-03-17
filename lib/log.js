var config = require('./config');
var logentries = require('node-logentries');
var winston = require('winston');

/**
 * If a `LOGENTRIES_TOKEN` exists, add it as a transport
 */

if (config.LOGENTRIES_TOKEN) {
  logentries.logger({
    token: config.LOGENTRIES_TOKEN
  }).winston(winston, {});
}

/**
 * Expose `winston`
 */

module.exports = winston;
