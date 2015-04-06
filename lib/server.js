var http = require('http')

var api = require('./api')
var log = require('./log')

var port = process.env.PORT || 80

// Create and run the server

http
  .createServer(api)
  .listen(port, function (err) {
    if (err) log.error('error creating server', err)
    log.info('express server running on port ' + port)
  })
