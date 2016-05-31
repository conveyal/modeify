const config = require('./config')
const logentries = require('node-logentries')
const morgan = require('morgan')
const onFinished = require('on-finished')
const winston = module.exports = require('winston')

if (config.LOGENTRIES_TOKEN) {
  logentries.logger({
    token: config.LOGENTRIES_TOKEN
  }).winston(winston, {})

  // remove console logger
  winston.remove(winston.transports.Console)
}

winston.middleware = middleware

/**
 * Log all API responses
 */

function middleware (req, res, next) {
  req._startAt = process.hrtime()
  req._startTime = new Date()

  onFinished(res, (err) => {
    if (err) {
      winston.error('log error', err)
    }

    const status = morgan.status(req, res)
    const data = {
      method: req.method,
      referrer: morgan.referrer(req, res),
      remoteAddress: morgan['remote-addr'](req, res),
      responseTime: morgan['response-time'](req, res),
      statusCode: status,
      url: morgan.url(req, res),
      userAgent: morgan['user-agent'](req, res)
    }

    if (status >= 500) {
      winston.error('api response', data)
    } else if (status >= 400) {
      winston.warn('api response', data)
    } else {
      winston.info('api response', data)
    }
  })

  next()
}
