var api = require('../../lib/api')
var http = require('http')
var Nightmare = require('nightmare')
var ready = false

// Create the server & bind on an ephemeral port

var server = http
  .createServer(api)
  .listen(0, function () {
    ready = true
  })

  // Create a new Nightmare instance

module.exports = function (opts) {
  opts = opts || {}

  var address = server.address()
  var url = 'http://localhost:' + address.port + (opts.url || '')
  var viewport = opts.viewport || {
      height: 1200,
      width: 1920
    }

  return new Nightmare()
    .viewport(viewport.width, viewport.height)
    .on('error', function (err, trace) {
      if (err) console.error(err)
      if (trace) console.error(trace)
    })
    .goto(url)
    .wait()
}

// Expose `ready`

module.exports.ready = function (fn) {
  if (ready) {
    fn()
  } else {
    server.on('listening', fn)
  }
}
