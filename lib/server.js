const http = require('http')

const api = require('./api')
const log = require('./log')

const PORT = process.env.PORT || 80
const TIMEOUT = 5 * 1000

const server = module.exports = http.createServer(api)

listen()

function listen () {
  server.listen(process.env.PORT || 80, function (err) {
    if (err) {
      log.error('error creating server')
      log.error(err.name, err.message, err.stack)
      setTimeout(() => listen(), TIMEOUT)
    } else {
      log.info(`express server running on port ${PORT}`)
    }
  })
}

process.on('unhandledRejection', (reason, p) => {
  log.error(`Unhandled Rejection at: Promise ${p} reason: ${reason}`)
})

process.on('warning', (warning) => {
  log.info(`Warning ${warning.name}: ${warning.message}`, warning.stack)
})
