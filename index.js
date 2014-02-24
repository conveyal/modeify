
/**
 * If ENV is not set throw
 */

if (process.env.NODE_ENV === undefined) throw new Error('Envrionment variables must be set. See `.env.tmp`.');

/**
 * Port
 */

var port = process.env.PORT;

/**
 * Dependencies
 */

var debug = require('debug')('commute-planner');
var server = require('./server');

/**
 * If environment is `development`, build on load
 */

if (process.env.NODE_ENV === 'development') require('./bin/build');

/**
 * Run the server
 */

server.listen(port, function() {
  debug('[commute-planner] server listening on %s', port);
});
