var bodyParser = require('body-parser')
var exec = require('child_process').exec
var express = require('express')
var connectMongo = require('connect-mongo')
var read = require('fs').readFileSync
var session = require('express-session')
var toSlugCase = require('to-slug-case')
var handlebars = require('handlebars')

var auth = require('./auth')
var config = require('./config')
var mongo = require('./mongo')
var log = require('./log')

var env = process.env.NODE_ENV
var MongoStore = connectMongo(session)
var slug = toSlugCase(config.application)

var cookieKey = slug + '.' + process.env.NODE_ENV
var cookieSecret = new Buffer(process.env.COOKIE_SECRET + '.' + cookieKey).toString('base64')
var thirtyDays = 2592000000 // 30 days in ms

var app = module.exports = express()

if (env === 'development') {
  app
    .use(require('errorhandler')())
    .use('/assets', require('serve-static')(__dirname + '/../assets'))
    .use(require('morgan')('dev'))
} else if (env !== 'test') {
  app.use(log.middleware)
}

app
  .use(require('compression')())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())
  .use(session({
    cookie: {
      maxage: thirtyDays
    },
    name: cookieKey,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: cookieSecret,
    secure: false,
    store: new MongoStore({ mongooseConnection: mongo.connection })
  }))

app.use('/api', auth)
app.use('/api/campaigns', require('./campaign'))
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

/**
 * Logger
 */

app.post('/api/log', function (req, res) {
  var type = req.body.type
  if (log[type]) log[type](req.body.text)
  res.status(200).end()
})

/**
 * Manager
 */

app.all('/manager*', function (req, res) {
  compile('manager', function (err, html) {
    res.status(200).send(html)
  })
})

/**
 * Planner
 */

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
      minified: false,
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
