const http = require('http')

const api = require('./api')
const log = require('./log')

const server = module.exports = http.createServer(api)

api.on('stormpath.ready', () => listen(server, process.env.PORT || 80, 5 * 1000))

function listen (server, port, timeout) {
  server.listen(port, function (err) {
    if (err) {
      log.error('error creating server')
      log.error(err.name, err.message, err.stack)
      setTimeout(() => listen(server, port, timeout), timeout)
    } else {
      log.info('express server running on port ' + port)
    }
  })
}

process.on('unhandledRejection', (reason, p) => {
  log.error(`Unhandled Rejection at: Promise ${p} reason: ${reason}`)
})

process.on('warning', (warning) => {
  log.info(`Warning ${warning.name}: ${warning.message}`, warning.stack)
})
