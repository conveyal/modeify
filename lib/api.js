var bodyParser = require('body-parser')
var exec = require('child_process').exec
var express = require('express')
var read = require('fs').readFileSync
var handlebars = require('handlebars')

var config = require('./config')
var log = require('./log')
var stormpath = require('./stormpath')

var app = module.exports = express()

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

stormpath.initializeMiddleware(app)

app.use('/api/carpool', require('./carpool/api'))
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

// No API endpoint found

app.use('/api', function (req, res) {
  res.status(404).end()
})

// Log from the client

app.post('/api/log', function (req, res) {
  var type = req.body.type
  if (log[type]) log[type](req.body.text)
  res.status(200).end()
})

app.all('/manager*', function (req, res) {
  compile('manager', function (err, html) {
    res.status(200).send(html)
  })
})

app.all('*', function (req, res) {
  compile('planner', function (err, html) {
    res.status(200).send(html)
  })
})

/**
 * Handle Errors
 */

app.use(function (err, req, res, next) {
  err = err || new Error('Server error.')
  res.status(err.status || 500).send(err.message || err)
})

/**
 * Compile templates
 */

var templates = {}
var version = null

function compile (name, next, v) {
  if (templates[name]) {
    next(null, templates[name])
  } else if (v) {
    templates[name] = handlebars.compile(read(__dirname + '/../client/' + name + '.html', {
      encoding: 'utf8'
    }))({
      application: config.application,
      google_site_verification: config.google_site_verification,
      minified: process.env.NODE_ENV !== 'development',
      segmentio_key: config.segmentio_key,
      static_url: config.static_url,
      version: v
    })

    next(null, templates[name])
  } else if (version) {
    compile(name, next, version)
  } else {
    exec('git rev-parse --short HEAD', function (err, stdout) {
      if (err) {
        next(err)
      } else {
        version = stdout.toString().split('\n').join('')
        compile(name, next, version)
      }
    })
  }
}
