const bodyParser = require('body-parser')
const {execSync} = require('child_process')
const express = require('express')
const path = require('path')

const config = require('./config')
const log = require('./log')
const pkg = require('../package.json')
const {group, groupsRequired, initializeStormpathMiddleware} = require('./stormpath')

const app = module.exports = express()

app.set('view engine', 'jade')

if (config.env === 'development') {
  app
    .use(require('errorhandler')())
    .use('/assets', require('serve-static')(path.join(__dirname, '/../assets')))
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
app.use('/api/user-activity', require('./user-activity'))
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

app.all('/manager*', groupsRequired([group.administrator(), group.manager()], false), function (req, res) {
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
  log.error(err)
  res.status(err.status || 500).send(err.message || err)
})

var version
try {
  var stdout = execSync('git describe --always --tag')
  version = stdout.toString().split('\n').join('')
} catch (e) {
  version = pkg.version + '-' + (process.env.HEROKU_SLUG_COMMIT || 0)
}

function setLocals (req, res, next) {
  res.locals.application = config.application
  res.locals.applicationName = config.name
  res.locals.google_site_verification = config.google_site_verification
  res.locals.minified = process.env.NODE_ENV !== 'development'
  res.locals.segmentio_key = config.segmentio_key
  res.locals.static_url = config.static_url
  res.locals.version = version
  next()
}
