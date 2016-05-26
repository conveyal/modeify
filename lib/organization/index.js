const express = require('express')
const stormpath = require('express-stormpath')

const log = require('../log')
const Org = require('./model')
const {createGroups, groupsRequired} = require('../stormpath')

const router = express.Router()

module.exports = router

router.get('/', stormpath.authenticationRequired, groupsRequired(['administrator']), function (req, res) {
  Org.find(function (err, models) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(models)
    }
  })
})

// Default get one
router.get('/:id', stormpath.authenticationRequired, adminOrOrgManager, byId, function (req, res) {
  res.status(200).send(req.organization)
})

router.post('/', stormpath.authenticationRequired, groupsRequired(['administrator']), function (req, res) {
  let org = null
  Org
    .create(req.body)
    .then(newOrg => {
      org = newOrg
      return createGroups(req.stormpathDirectory, [`organization-${org._id}`, `organization-${org._id}-manager`])
    })
    .then(groups => {
      res.status(201).send(org)
    })
    .catch(err => {
      log.error(err)
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).send('Resource exists with that information.')
      } else {
        res.status(400).send(err)
      }
    })
})

/**
 * Update an org
 */

router.put('/:id', stormpath.authenticationRequired, adminOrOrgManager, byId, function (req, res) {
  req.organization.name = req.body.name
  req.organization.address = req.body.address
  req.organization.city = req.body.city
  req.organization.state = req.body.state
  req.organization.zip = req.body.zip
  req.organization.labels = req.body.labels
  req.organization.opts = req.body.opts
  req.organization.main_url = req.body.main_url
  req.organization.logo_url = req.body.logo_url
  req.organization.contact = req.body.contact
  req.organization.email = req.body.email
  req.organization.coordinate = req.body.coordinate
  req.organization.save(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

router.delete('/:id', byId, function (req, res) {
  req.organization.remove(function (err) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204).end()
    }
  })
})

function adminOrOrgManager (req, res, next) {
  groupsRequired(['administrator', `organization-${req.params.id}-manager`], false)(req, res, next)
}

function byId (req, res, next) {
  Org.findById(req.params.id, function (err, model) {
    if (err) {
      res.status(400).send(err)
    } else if (!model) {
      res.status(404).send('Organization does not exist.')
    } else {
      req.organization = model
      next()
    }
  })
}
