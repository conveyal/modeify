import express from 'express'
import stormpath from 'express-stormpath'

import User from './model'

const app = express()

export default app

/**
 * Get all users
 */

app.get('/', stormpath.authenticationRequired, stormpath.groupsRequired(['admins']), function (req, res) {
  User
    .querystring(req.query)
    .select('email created modified type')
    .exec(function (err, users) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(users)
      }
    })
})

/**
 * Create a user
 */

app.post('/', stormpath.authenticationRequired, stormpath.groupsRequired(['admins']), function (req, res) {
  if (!req.body.email) {
    return res.status(400).send('Email address is required')
  }

  User.findOrCreate(req.body, function (err, user, found) {
    if (err) {
      res.status(400).send(err)
    } else if (found && user.type !== 'commuter') {
      res.status(409).send('User already exists for this email address.')
    } else {
      user.type = req.body.type
      user.sendAccountSetup(function (err) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(201).send(user)
        }
      })
    }
  })
})

/**
 * Change password request
 */

app.post('/change-password-request', function (req, res) {
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (err) {
      res.status(400).send(err)
    } else if (!user) {
      res.status(404).send('Email does not exist.')
    } else {
      user.sendChangePasswordRequest(function (err) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(204).end()
        }
      })
    }
  })
})

/**
 * Change password
 */

app.post('/change-password', function (req, res) {
  var key = req.body.change_password_key
  User.changePassword(key, req.body.password, function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

/**
 * Confirm Email Address
 */

app.get('/confirm-email/:key', function (req, res) {
  var key = req.params.key
  User.confirmEmail(key, function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

/**
 * Middleware to retrieve a user by id
 */

function get (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      res.status(400).send(err)
    } else if (!user) {
      res.status(404).send('User does not exist.')
    } else {
      req.foundUser = user
      next()
    }
  })
}

/**
 * Get a specific user
 */

app.get('/:id', stormpath.authenticationRequired, stormpath.groupsRequired(['admins']), get, function (req, res) {
  res.status(200).send(req.foundUser)
})

/**
 * Update a user
 */

app.put('/:id', stormpath.authenticationRequired, stormpath.groupsRequired(['admins']), get, function (req, res) {
  for (var key in req.body) {
    req.foundUser[key] = req.body[key]
  }

  req.foundUser.save(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

/**
 * Delete a user
 */

app.delete('/:id', stormpath.authenticationRequired, stormpath.groupsRequired(['admins']), get, function (req, res) {
  req.foundUser.remove(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})
