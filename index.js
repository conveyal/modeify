
/**
 * If ENV is not set throw
 */

if (process.env.NODE_ENV === undefined) throw new Error('Envrionment variables must be set. See `.env.tmp`.');

/**
 * Env
 */

var port = process.env.PORT;

/**
 * Dependencies
 */

var build = require('./bin/build');
var debug = require('debug')('commute-planner');
var server = require('./server');

/**
 * Build the client
 */

build();

/**
 * Run the server
 */

server.listen(port, function() {
  debug('[commute-planner] server listening on %s', port);
});
