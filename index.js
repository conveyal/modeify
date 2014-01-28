
/**
 * Env
 */

var port = process.env.PORT;

/**
 * Dependencies
 */

var server = require('./server');

/**
 * Run the server
 */

server.listen(port, function() {
  console.log('Server listening on port', port);
});
