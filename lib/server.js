import http from 'http'

import api from './api'
import log from './log'

const server = http.createServer(api)

export default server

listen(server, process.env.PORT || 80, 5 * 1000)

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
