import express from 'express'
import stormpath from 'express-stormpath'

import CommuterLocation from '../commuter-locations/model'
import Commuter from './model'

const app = express.Router()

export default app

/**
 * Get all commuters
 */

app.get('/', stormpath.authenticationRequired, function (req, res) {
  Commuter
    .querystring(req.query)
    .populate('_user', 'email')
    .exec((err, commuters) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(commuters)
      }
    })
})

/**
 * Create an commuter
 */

app.post('/', stormpath.authenticationRequired, function (req, res) {
  const commuterData = req.body || {}
  const userData = req.body._user || {}
  let commuter = null

  Commuter
    .generate(userData, commuterData)
    .then(newCommuter => {
      commuter = newCommuter
      if (commuterData._location) {
        return CommuterLocation
          .create({
            _commuter: commuter._id,
            _location: commuterData._location
          })
      } else {
        return commuter
      }
    })
    .then(() => {
      res.status(201).send(commuter)
    })
    .catch(err => {
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
    .populate('_user', 'email')
    .exec((err, commuter) => {
      if (err) {
        res.status(400).send(err)
      } else if (!commuter) {
        res.status(404).send('Commuter does not exist for link.')
      } else {
        res.status(200).send(commuter)
      }
    })
})

/**
 * Middleware to retrieve an commuter by id
 */

function get (req, res, next) {
  Commuter
    .findById(req.params.id)
    .populate('_user', 'email')
    .exec(function (err, commuter) {
      if (err) {
        res.status(400).send(err)
      } else if (!commuter) {
        res.status(404).send('Commuter does not exist.')
      } else {
        req.commuter = commuter
        next()
      }
    })
}

function getWithOrg (req, res, next) {
  Commuter
    .findById(req.params.id)
    .populate('_organization')
    .populate('_user', 'email')
    .exec(function (err, commuter) {
      if (err) {
        res.status(400).send(err)
      } else if (!commuter) {
        res.status(404).send('Commuter does not exist.')
      } else {
        req.commuter = commuter
        next()
      }
    })
}

/**
 * Get a specific commuter
 */

app.get('/:id', stormpath.authenticationRequired, get, function (req, res) {
  res.status(200).send(req.commuter)
})

/**
 * Add an email address to an anonymous user
 */

app.post('/:id/add-email', stormpath.authenticationRequired, get, function (req, res) {
  if (!req.body.email) {
    return res.status(400).send('Email address is required')
  }

  req.commuter.addEmail(req.body.email, function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      req.session.commuter = req.commuter.toJSON()
      req.session.user = req.commuter._user.toJSON()
      req.session.touch()

      delete req.session.user.password

      res.status(204).end()
    }
  })
})

/**
 * Sign up for ride sharing
 */

app.post('/:id/carpool-sign-up', stormpath.authenticationRequired, get, function (req, res) {
  req.commuter.carpoolSignUp(req.body, function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      req.session.commuter = req.commuter.toJSON()
      req.session.user = req.commuter._user.toJSON()
      req.session.touch()

      delete req.session.user.password

      res.status(204).end()
    }
  })
})

/**
 * Update an commuter
 */

app.put('/:id', stormpath.authenticationRequired, get, function (req, res) {
  if ((!req.session.user || req.session.user.type === 'commuter') && req.session.commuter._id !== req.params.id) {
    return res.status(403).send('Cannot change other commuters.')
  }

  for (let key in req.body) {
    if (key === '_user' || key === '_organization') {
      continue
    }
    req.commuter[key] = req.body[key]
    req.commuter.isModified(key)
  }

  req.commuter.save(function (err, commuter) {
    if (err) {
      res.status(400).send(err)
    } else {
      if (req.session.commuter) {
        req.session.commuter = req.commuter.toJSON()
        req.session.touch()
      }

      res.status(200).send(commuter)
    }
  })
})

/**
 * Send a plan
 */

app.post('/:id/send-plan', stormpath.authenticationRequired, getWithOrg, function (req, res) {
  req.commuter.sendPlan(function (err, email) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(201).send(email)
    }
  })
})

/**
 * Delete a commuter
 */

app.delete('/:id', stormpath.authenticationRequired, get, function (req, res) {
  var user = req.commuter._user
  var type = user.type
  req.commuter.remove(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      if (type !== 'commuter') {
        return res.status(204).end()
      }

      user.remove(function (err) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(204).end()
        }
      })
    }
  })
})
