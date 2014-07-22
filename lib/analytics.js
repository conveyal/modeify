var Analytics = require('analytics-node');
var config = require('./config');

/**
 * Expose logged in instance of Analytics
 */

module.exports = new Analytics(config.segmentio_key);
