var config = require('./config')
var logentries = require('node-logentries')
var morgan = require('morgan')
var onFinished = require('on-finished')
var winston = require('winston')

if (config.LOGENTRIES_TOKEN) {
  logentries.logger({
    token: config.LOGENTRIES_TOKEN
  }).winston(winston, {})

  // remove console logger
  winston.remove(winston.transports.Console)
}

/**
 * Expose winston
 */

module.exports = winston

/**
 * Log all API responses
 */

module.exports.middleware = function (req, res, next) {
  req._startAt = process.hrtime()
  req._startTime = new Date()

  onFinished(res, function (err) {
    if (err) {
      winston.error('log error', err)
    }

    var status = morgan.status(req, res)
    var data = {
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
