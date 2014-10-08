var api = require('../../lib/api');
var http = require('http');
var Nightmare = require('nightmare');
var port = process.env.PORT || 5001;
var ready = false;

module.exports = function(url) {
  return new Nightmare()
    .goto('http://localhost:' + port + (url || ''));
};

// Create and run the server

var server = http
  .createServer(api)
  .listen(port, function(err) {
    console.log('Server listening on port', port);
    ready = true;
  });

// Expose `ready`

module.exports.ready = function(fn) {
  server.on('listening', fn);
};
