import {Router} from 'express'
import {v4 as uuid} from 'node-uuid'

import {authenticationRequired, group, groupsRequired} from '../stormpath'

const app = Router()

export default app

/**
 * Get all users
 */

app.get('/', authenticationRequired, groupsRequired([group.administrator()]), function (req, res) {
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

app.get('/managers', authenticationRequired, groupsRequired([group.administrator()]), getManagerGroup, function (req, res) {
  res.status(200).send(req.managerGroup.accounts.items)
})

/**
 * Create a manager or promote a user to be a manager
 */

app.post('/managers', authenticationRequired, groupsRequired([group.administrator()]), getManagerGroup, function (req, res) {
  if (!req.body.password) {
    req.body.password = uuid().replace(/-/g, '')
  }

  createOrRetrieveAccount(req.stormpathDirectory, req.body)
    .then(account => {
      account.addToGroup(req.managerGroup, (err) => {
        if (err) {
          if (err.code === 409) { // already in the group
            res.status(409).send(`${req.body.givenName} ${req.body.surname} (${req.body.email}) is already a manager.`)
          } else {
            res.status(400).send(err)
          }
        } else {
          res.status(200).send(account)
        }
      })
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

/**
 * Create a user
 */

app.post('/', authenticationRequired, groupsRequired([group.administrator()]), function (req, res) {
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
  req.stormpathClient.getAccount(`https://api.stormpath.com/v1/accounts/${req.params.id}`, { expand: 'groups,customData' }, (err, user) => {
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

app.get('/:id', authenticationRequired, groupsRequired([group.administrator()]), get, function (req, res) {
  res.status(200).send(req.foundUser)
})

/**
 * Get the user's groups
 */

app.get('/:id/groups', authenticationRequired, groupsRequired([group.administrator()]), get, function (req, res) {
  res.status(200).send(req.foundUser.groups.items)
})

/**
 * Update a user
 */

app.put('/:id', authenticationRequired, groupsRequired([group.administrator()]), get, function (req, res) {
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

app.delete('/:id', authenticationRequired, groupsRequired([group.administrator()]), get, function (req, res) {
  req.foundUser.delete(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

function getManagerGroup (req, res, next) {
  req.stormpathDirectory.getGroups({ name: 'manager', expand: 'accounts' }, (err, groups) => {
    if (err) {
      next(err)
    } else if (groups.items.length < 1) {
      next(new Error('Manager group does not exist for this directory.'))
    } else {
      req.managerGroup = groups.items[0]
      next()
    }
  })
}

function createOrRetrieveAccount (directory, data) {
  return new Promise((resolve, reject) => {
    directory.createAccount(data, (err, account) => {
      if (err) {
        if (err.code === 2001) { // acount with that email already exists
          directory.getAccounts({ email: data.email }, function (err, accounts) {
            if (err) {
              reject(err)
            } else {
              resolve(accounts.items[0])
            }
          })
        } else {
          reject(err)
        }
      } else {
        resolve(account)
      }
    })
  })
}
