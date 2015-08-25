var bodyParser = require('body-parser')
var exec = require('child_process').exec
var express = require('express')
var stormpath = require('express-stormpath')

var config = require('./config')
var log = require('./log')
var package = require('../package.json')

import {initializeStormpathMiddleware} from './stormpath'

var app = module.exports = express()

app.set('view engine', 'jade')

if (config.env === 'development') {
  app
    .use(require('errorhandler')())
    .use('/assets', require('serve-static')(__dirname + '/../assets'))
    .use(require('morgan')('dev'))
} else if (config.env !== 'test') {
  app.use(log.middleware)
}

app
  .use(require('compression')())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(setLocals)

initializeStormpathMiddleware(app)

app.use('/api/commuters', require('./commuter'))
app.use('/api/commuter-locations', require('./commuter-locations/api'))
app.use('/api/events', require('./event'))
app.use('/api/emails', require('./email'))
app.use('/api/feedback', require('./feedback/api'))
app.use('/api/health', require('./health'))
app.use('/api/geocode', require('./geocode'))
app.use('/api/journeys', require('./journey'))
app.use('/api/locations', require('./location'))
app.use('/api/ridepools', require('./ridepool'))
app.use('/api/organizations', require('./organization'))
app.use('/api/otp', require('./otp/api'))
app.use('/api/plan', require('./plan'))
app.use('/api/route-resources', require('./route-resource/api'))
app.use('/api/users', require('./user'))
app.use('/api/webhooks', require('./webhooks'))

// Log from the client

app.post('/api/log', function (req, res) {
  var type = req.body.type
  if (log[type]) log[type](req.body.text)
  res.status(200).end()
})

// No API endpoint found

app.use('/api', function (req, res) {
  res.status(404).end()
})

app.all('/manager*', stormpath.groupsRequired(['admin', 'manager'], false), function (req, res) {
  res.render('manager')
})

app.all('*', function (req, res) {
  res.render('planner')
})

/**
 * Handle Errors
 */

app.use(function (err, req, res, next) {
  err = err || new Error('Server error.')
  res.status(err.status || 500).send(err.message || err)
})

function setLocals (req, res, next) {
  res.locals.application = config.application
  res.locals.google_site_verification = config.google_site_verification
  res.locals.minified = process.env.NODE_ENV !== 'development'
  res.locals.segmentio_key = config.segmentio_key
  res.locals.static_url = config.static_url
  res.locals.version = package.version
  next()
}
