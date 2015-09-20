import {Router} from 'express'
import stormpath from 'express-stormpath'

import {authenticationRequired, group} from '../stormpath'

const app = Router()

export default app

/**
 * Get all users
 */

app.get('/', authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  req.stormpathDirectory.getAccounts((err, accounts) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(accounts)
    }
  })
})

/**
 * Get all managers
 */

app.get('/managers', authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  req.stormpathDirectory.getGroups({ name: 'manager' }, { expand: 'accounts' }, (err, groups) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(groups.items[0].accounts)
    }
  })
})

/**
 * Create a user
 */

app.post('/', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  if (!req.body.email) {
    return res.status(400).send('Email address is required')
  }

  req.stormpathDirectory.createAccount(req.body, (err, createdAccount) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(createdAccount)
    }
  })
})

/**
 * Middleware to retrieve a user by id
 */

function get (req, res, next) {
  req.stormpathClient.getAccount(`https://api.stormpath.com/v1/accounts/${req.params.id}`, { expand: 'customData' }, (err, user) => {
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

app.get('/:id', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), get, function (req, res) {
  res.status(200).send(req.foundUser)
})

/**
 * Update a user
 */

app.put('/:id', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), get, function (req, res) {
  if (req.body.givenName) req.foundUser.givenName = req.body.givenName
  if (req.body.surname) req.foundUser.surname = req.body.surname
  if (req.body.email) req.foundUser.email = req.body.email

  for (var key in req.body.customData) {
    req.foundUser.customData[key] = req.body.customData[key]
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

app.delete('/:id', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), get, function (req, res) {
  req.foundUser.delete(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})
