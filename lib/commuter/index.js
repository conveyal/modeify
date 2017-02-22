const express = require('express')

const CommuterLocation = require('../commuter-locations/model')
const Commuter = require('./model')
const {authenticationRequired, createAccount} = require('../stormpath')

const log = require('../log')

const app = module.exports = express.Router()

/**
 * Get all commuters
 */

app.get('/', authenticationRequired, function (req, res) {
  Commuter
    .querystring(req.query)
    .exec()
    .then(commuters => {
      res.status(200).send(commuters)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

/**
 * Create a commuter
 */

app.post('/', authenticationRequired, function (req, res) {
  let commuter = null
  let commuterPromise = null

  if (!req.body.createAccount) {
    const commuterData = Object.assign({}, req.body, { account: null })
    commuterPromise = Commuter.create(commuterData)
  } else {
    let commuterAccount = null
    if (req.body.email === req.user.email) {
      commuterAccount = Promise.resolve(req.user)
    } else {
      commuterAccount = createAccount(req.stormpathDirectory, {
        email: req.body.email,
        givenName: req.body.givenName,
        surname: req.body.surname
      })
    }

    commuterPromise = commuterAccount
      .then(account => {
        req.body.account = account.href
        console.log('** creating commuter after acct', req.body)
        return Commuter.create(req.body)
      })
  }

  commuterPromise
    .then(createdCommuter => {
      commuter = createdCommuter
      if (req.body._location) {
        return CommuterLocation.create({
          _commuter: commuter._id,
          _location: req.body._location
        })
      } else {
        return commuter
      }
    })
    .then(() => {
      res.status(201).send(commuter)
    })
    .catch(err => {
      log.info('error creating commuter: ' + err)
      res.status(400).send(err)
    })
})

/**
 * Get with a link
 */

app.get('/link/:link', function (req, res) {
  Commuter
    .findOne()
    .where('link', req.params.link)
    .populate('_organization')
    .exec()
    .then(commuter => {
      if (!commuter) {
        res.status(404).send('Commuter does not exist for link.')
      } else {
        res.status(200).send(commuter)
      }
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

/**
 * Middleware to retrieve a commuter by id
 */

function get (req, res, next) {
  Commuter
    .findById(req.params.id)
    .exec()
    .then(commuter => {
      if (!commuter) {
        return res.status(404).send('Commuter does not exist.')
      }
      req.commuter = commuter
      next()
    })
    .catch(err => {
      res.status(400).send(err)
    })
}

function getWithOrg (req, res, next) {
  Commuter
    .findById(req.params.id)
    .populate('_organization')
    .exec()
    .then(commuter => {
      if (!commuter) {
        return res.status(404).send('Commuter does not exist.')
      }
      req.commuter = commuter
      next()
    })
    .catch(err => {
      res.status(400).send(err)
    })
}

/**
 * Get a specific commuter
 */

app.get('/:id', authenticationRequired, get, function (req, res) {
  res.status(200).send(req.commuter)
})

/**
 * Sign up for ride sharing
 */

app.post('/:id/carpool-sign-up', authenticationRequired, get, function (req, res) {
  req.commuter.carpoolSignUp(req.body)
    .then(() => {
      res.status(204).end()
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

/**
 * Update an commuter
 */

app.put('/:id', authenticationRequired, get, function (req, res) {
  if (req.user.href !== req.commuter.account) {
    return res.status(403).send('Cannot change other commuters.')
  }

  for (const key in req.body) {
    if (key === '_organization') {
      continue
    }
    req.commuter[key] = req.body[key]
    req.commuter.isModified(key)
  }

  req.commuter.save()
    .then((commuter) => {
      res.status(200).send(commuter)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

/**
 * Send a plan
 */

app.post('/:id/send-plan', authenticationRequired, getWithOrg, function (req, res) {
  req.commuter.sendPlan()
    .then(email => {
      res.status(201).send(email)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})
