var api = require('./lib/api');
var http = require('http');
var log = require('./lib/log');
var port = process.env.PORT || 80;

// Create and run the server

http
  .createServer(api)
  .listen(port, function(err) {
    log.info('express server running on port ' + port);
  });
